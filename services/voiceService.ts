
import { User } from '../types';

// Events types for signaling
type SignalMessage = 
  | { type: 'join'; userId: string; channelId: string }
  | { type: 'leave'; userId: string; channelId: string }
  | { type: 'offer'; userId: string; targetId: string; offer: RTCSessionDescriptionInit; channelId: string }
  | { type: 'answer'; userId: string; targetId: string; answer: RTCSessionDescriptionInit; channelId: string }
  | { type: 'ice-candidate'; userId: string; targetId: string; candidate: RTCIceCandidateInit; channelId: string };

type VoiceState = {
  activeChannelId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isConnected: boolean;
  participants: string[]; // Current channel participants (for WebRTC)
  channelParticipants: Record<string, string[]>; // Global map of who is in which channel { channelId: [userIds] }
  speakingUsers: Set<string>;
  isVideoEnabled: boolean;
  isScreenSharingEnabled: boolean;
};

class VoiceService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private signalingChannel: BroadcastChannel;
  private audioContext: AudioContext | null = null;
  private analysers: Map<string, AnalyserNode> = new Map();
  
  private currentUserId: string | null = null;
  private currentChannelId: string | null = null;
  
  private state: VoiceState = {
    activeChannelId: null,
    isMuted: false,
    isDeafened: false,
    isConnected: false,
    participants: [],
    channelParticipants: {},
    speakingUsers: new Set(),
    isVideoEnabled: false,
    isScreenSharingEnabled: false
  };

  private listeners: Set<(state: VoiceState) => void> = new Set();
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // We use BroadcastChannel to simulate a signaling server between tabs
    this.signalingChannel = new BroadcastChannel('kristal-voice-signaling');
    
    this.signalingChannel.onmessage = async (event) => {
      this.handleSignalMessage(event.data);
    };

    // Speaking detection loop
    setInterval(() => this.detectSpeaking(), 100);
  }

  public init(userId: string) {
    this.currentUserId = userId;
  }

  public subscribe(listener: (state: VoiceState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public async joinChannel(channelId: string) {
    // If already in this channel, do nothing (or just notify)
    if (this.currentChannelId === channelId) return;
    
    // If in another channel, leave it first
    if (this.currentChannelId) await this.leaveChannel();

    try {
      this.currentChannelId = channelId;
      this.state.isConnected = true;
      this.state.activeChannelId = channelId;
      
      // Get Mic Access
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize participant list for this channel
      this.state.participants = [this.currentUserId!];
      
      // Update global map
      this.updateGlobalParticipants(channelId, this.currentUserId!, 'add');
      
      // Setup Local Audio Analysis (for own speaking indicator)
      this.setupAudioAnalysis('local', this.localStream);

      // Signal others
      this.sendSignal({ type: 'join', userId: this.currentUserId!, channelId });
      
      this.notify();
    } catch (err) {
      console.error("Failed to join voice channel:", err);
      this.leaveChannel();
    }
  }

  public async leaveChannel() {
    if (!this.currentChannelId) return;

    this.sendSignal({ type: 'leave', userId: this.currentUserId!, channelId: this.currentChannelId });

    // Update global map locally
    this.updateGlobalParticipants(this.currentChannelId, this.currentUserId!, 'remove');

    // Cleanup Peers
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Cleanup Audio
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    
    this.remoteAudioElements.forEach(el => el.remove());
    this.remoteAudioElements.clear();

    if (this.audioContext && this.audioContext.state !== 'closed') {
       this.audioContext.close();
       this.audioContext = null;
    }
    
    this.analysers.clear();

    this.currentChannelId = null;
    this.state.activeChannelId = null;
    this.state.isConnected = false;
    this.state.participants = [];
    this.state.speakingUsers.clear();
    this.state.isVideoEnabled = false;
    this.state.isScreenSharingEnabled = false;
    
    this.notify();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.state.isMuted;
      });
    }
    this.notify();
  }

  public toggleDeafen() {
    this.state.isDeafened = !this.state.isDeafened;
    // Mute all remote audio elements
    this.remoteAudioElements.forEach(el => {
      el.muted = this.state.isDeafened;
    });
    this.notify();
  }
  
  public toggleVideo() {
    this.state.isVideoEnabled = !this.state.isVideoEnabled;
    this.notify();
  }

  public toggleScreenShare() {
    this.state.isScreenSharingEnabled = !this.state.isScreenSharingEnabled;
    this.notify();
  }

  // --- WebRTC Core ---

  private async createPeerConnection(targetUserId: string, initiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Free public STUN
    });

    this.peerConnections.set(targetUserId, pc);

    // Add local tracks
    this.localStream?.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream!);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.currentChannelId) {
        this.sendSignal({
          type: 'ice-candidate',
          userId: this.currentUserId!,
          targetId: targetUserId,
          candidate: event.candidate.toJSON(),
          channelId: this.currentChannelId
        });
      }
    };

    // Handle Remote Stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.setupRemoteAudio(targetUserId, remoteStream);
    };

    if (initiator && this.currentChannelId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignal({
        type: 'offer',
        userId: this.currentUserId!,
        targetId: targetUserId,
        offer,
        channelId: this.currentChannelId
      });
    }

    return pc;
  }

  private setupRemoteAudio(userId: string, stream: MediaStream) {
    if (this.remoteAudioElements.has(userId)) return;

    const audio = new Audio();
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.muted = this.state.isDeafened; // Apply current deafen state
    document.body.appendChild(audio); // Must be in DOM to play
    this.remoteAudioElements.set(userId, audio);
    
    this.setupAudioAnalysis(userId, stream);
  }

  private setupAudioAnalysis(id: string, stream: MediaStream) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const source = this.audioContext.createMediaStreamSource(stream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    this.analysers.set(id, analyser);
  }

  private detectSpeaking() {
    if (this.analysers.size === 0) return;

    const bufferLength = 128; // Half fftSize
    const dataArray = new Uint8Array(bufferLength);
    let hasChanges = false;

    this.analysers.forEach((analyser, id) => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Threshold for "speaking"
      const isSpeaking = average > 10; 
      
      // Handle Local User Mute Visuals
      if (id === 'local' && this.state.isMuted) {
          if (this.state.speakingUsers.has(this.currentUserId!)) {
              this.state.speakingUsers.delete(this.currentUserId!);
              hasChanges = true;
          }
          return;
      }

      const targetId = id === 'local' ? this.currentUserId! : id;

      if (isSpeaking && !this.state.speakingUsers.has(targetId)) {
        this.state.speakingUsers.add(targetId);
        hasChanges = true;
      } else if (!isSpeaking && this.state.speakingUsers.has(targetId)) {
        this.state.speakingUsers.delete(targetId);
        hasChanges = true;
      }
    });

    if (hasChanges) this.notify();
  }

  // --- Signaling Handling ---

  private sendSignal(msg: SignalMessage) {
    this.signalingChannel.postMessage(msg);
  }

  private updateGlobalParticipants(channelId: string, userId: string, action: 'add' | 'remove') {
      const current = this.state.channelParticipants[channelId] || [];
      if (action === 'add') {
          if (!current.includes(userId)) {
              this.state.channelParticipants = {
                  ...this.state.channelParticipants,
                  [channelId]: [...current, userId]
              };
          }
      } else {
          this.state.channelParticipants = {
              ...this.state.channelParticipants,
              [channelId]: current.filter(id => id !== userId)
          };
      }
      this.notify();
  }

  private async handleSignalMessage(msg: SignalMessage) {
    if (!this.currentUserId) return;

    // Handle Global Presence (Who is in which channel)
    if (msg.type === 'join') {
        this.updateGlobalParticipants(msg.channelId, msg.userId, 'add');
    } else if (msg.type === 'leave') {
        this.updateGlobalParticipants(msg.channelId, msg.userId, 'remove');
    }
    
    // Ignore own messages for processing
    if (msg.userId === this.currentUserId) return;

    // WebRTC Signaling Logic - Only relevant if we are in the SAME channel
    if (this.currentChannelId && msg.channelId === this.currentChannelId) {
        switch (msg.type) {
          case 'join':
            this.addParticipant(msg.userId);
            // Connect to new joiner
            await this.createPeerConnection(msg.userId, true);
            break;

          case 'leave':
            this.removeParticipant(msg.userId);
            this.peerConnections.get(msg.userId)?.close();
            this.peerConnections.delete(msg.userId);
            this.remoteAudioElements.get(msg.userId)?.remove();
            this.remoteAudioElements.delete(msg.userId);
            this.analysers.delete(msg.userId);
            break;

          case 'offer':
            if (msg.targetId === this.currentUserId) {
               this.addParticipant(msg.userId); 
               const pc = await this.createPeerConnection(msg.userId, false);
               await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
               const answer = await pc.createAnswer();
               await pc.setLocalDescription(answer);
               this.sendSignal({ 
                   type: 'answer', 
                   userId: this.currentUserId, 
                   targetId: msg.userId, 
                   answer, 
                   channelId: this.currentChannelId 
               });
            }
            break;

          case 'answer':
            if (msg.targetId === this.currentUserId) {
                const pc = this.peerConnections.get(msg.userId);
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
            }
            break;

          case 'ice-candidate':
            if (msg.targetId === this.currentUserId) {
                const pc = this.peerConnections.get(msg.userId);
                if (pc) await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
            break;
        }
    }
  }

  private addParticipant(id: string) {
    if (!this.state.participants.includes(id)) {
      this.state.participants = [...this.state.participants, id];
      this.notify();
    }
  }

  private removeParticipant(id: string) {
    this.state.participants = this.state.participants.filter(p => p !== id);
    this.state.speakingUsers.delete(id);
    this.notify();
  }
}

export const voiceService = new VoiceService();
