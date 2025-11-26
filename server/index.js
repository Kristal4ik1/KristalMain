
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
// Renamed database file
const db = new Database('kristal.db');
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// Init DB
const schema = require('fs').readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Migrations for existing databases
const addColumn = (table, col, type) => {
    try {
        const check = db.prepare(`SELECT ${col} FROM ${table} LIMIT 1`).get();
    } catch (e) {
        console.log(`Adding ${col} column to ${table}...`);
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`).run();
    }
};

const createTable = (name, schema) => {
    try {
        db.prepare(`SELECT 1 FROM ${name} LIMIT 1`).get();
    } catch (e) {
        console.log(`Creating table ${name}...`);
        db.exec(`CREATE TABLE ${name} (${schema})`);
    }
};

// Server Migrations
addColumn('servers', 'invite_code', 'TEXT');
addColumn('servers', 'description', 'TEXT');
addColumn('servers', 'banner_color', 'TEXT');
addColumn('servers', 'roles', 'TEXT');
addColumn('servers', 'features', 'TEXT');
addColumn('servers', 'owner_id', 'TEXT');

// Channel Migrations
addColumn('channels', 'topic', 'TEXT');
addColumn('channels', 'slow_mode', 'INTEGER');
addColumn('channels', 'age_restricted', 'INTEGER');
addColumn('channels', 'bitrate', 'INTEGER');
addColumn('channels', 'user_limit', 'INTEGER');
addColumn('channels', 'video_quality', 'TEXT');
addColumn('channels', 'region', 'TEXT');

// Message Migrations
addColumn('messages', 'attachments', 'TEXT');

// User Migrations
addColumn('users', 'banner_color', 'TEXT');
addColumn('users', 'created_at', 'TEXT');

// Notes Table
createTable('user_notes', `
    owner_id TEXT NOT NULL,
    target_user_id TEXT NOT NULL,
    note TEXT,
    PRIMARY KEY (owner_id, target_user_id)
`);

// --- Routes ---

// Users
app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT * FROM users').all();
    const usersMap = {};
    users.forEach(u => {
        usersMap[u.id] = { 
            ...u, 
            isAdmin: !!u.is_admin, 
            isBot: !!u.is_bot,
            createdAt: u.created_at || new Date().toISOString() // Fallback
        };
    });
    res.json(usersMap);
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, avatar, status, email, passwordHash, salt, bannerColor } = req.body;
    
    const stmt = db.prepare(`
        UPDATE users SET 
        username = COALESCE(?, username), 
        avatar = COALESCE(?, avatar), 
        status = COALESCE(?, status),
        email = COALESCE(?, email),
        password_hash = COALESCE(?, password_hash),
        salt = COALESCE(?, salt),
        banner_color = COALESCE(?, banner_color)
        WHERE id = ?
    `);
    
    const info = stmt.run(username, avatar, status, email, passwordHash, salt, bannerColor, id);
    
    if (info.changes > 0) {
        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        res.json({ ...updated, isAdmin: !!updated.is_admin, isBot: !!updated.is_bot, createdAt: updated.created_at });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// User Notes
app.get('/api/users/:id/notes/:targetId', (req, res) => {
    const { id, targetId } = req.params;
    const row = db.prepare('SELECT note FROM user_notes WHERE owner_id = ? AND target_user_id = ?').get(id, targetId);
    res.json({ note: row ? row.note : '' });
});

app.post('/api/users/:id/notes/:targetId', (req, res) => {
    const { id, targetId } = req.params;
    const { note } = req.body;
    
    const stmt = db.prepare(`
        INSERT INTO user_notes (owner_id, target_user_id, note) 
        VALUES (?, ?, ?) 
        ON CONFLICT(owner_id, target_user_id) DO UPDATE SET note = excluded.note
    `);
    stmt.run(id, targetId, note);
    res.json({ success: true });
});

// Mutuals
app.get('/api/users/:id/mutual-servers/:targetId', (req, res) => {
    const { id, targetId } = req.params;
    // Get all servers
    const servers = db.prepare('SELECT id FROM servers').all();
    const mutuals = [];
    
    for (const server of servers) {
        // Check membership for both
        const m1 = db.prepare('SELECT 1 FROM server_members WHERE serverId = ? AND userId = ?').get(server.id, id);
        const m2 = db.prepare('SELECT 1 FROM server_members WHERE serverId = ? AND userId = ?').get(server.id, targetId);
        if (m1 && m2) {
             const serverDetails = db.prepare('SELECT * FROM servers WHERE id = ?').get(server.id);
             mutuals.push({
                 id: serverDetails.id,
                 name: serverDetails.name,
                 icon: serverDetails.icon
             });
        }
    }
    res.json(mutuals);
});

app.get('/api/users/:id/mutual-friends/:targetId', (req, res) => {
    const { id, targetId } = req.params;
    const f1 = db.prepare(`SELECT CASE WHEN user_id_1 = ? THEN user_id_2 ELSE user_id_1 END as friend_id FROM relationships WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = 'FRIEND'`).all(id, id, id).map(r => r.friend_id);
    const f2 = db.prepare(`SELECT CASE WHEN user_id_1 = ? THEN user_id_2 ELSE user_id_1 END as friend_id FROM relationships WHERE (user_id_1 = ? OR user_id_2 = ?) AND status = 'FRIEND'`).all(targetId, targetId, targetId).map(r => r.friend_id);
    const mutualIds = f1.filter(fid => f2.includes(fid));
    const mutualUsers = [];
    if (mutualIds.length > 0) {
        const placeholders = mutualIds.map(() => '?').join(',');
        mutualUsers.push(...db.prepare(`SELECT * FROM users WHERE id IN (${placeholders})`).all(...mutualIds));
    }
    res.json(mutualUsers);
});

// Auth
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body; 
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: "User not found" });
    const token = `token-${user.id}-${Date.now()}`;
    res.json({ user: { ...user, isAdmin: !!user.is_admin, isBot: !!user.is_bot, createdAt: user.created_at }, token });
});

app.post('/api/auth/register', (req, res) => {
    const { email, username, passwordHash, salt, avatar } = req.body;
    const id = `user-${Date.now()}`;
    const discriminator = Math.floor(1000 + Math.random() * 9000).toString();
    const createdAt = new Date().toISOString();
    try {
        db.prepare('INSERT INTO users (id, username, email, password_hash, salt, discriminator, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, username, email, passwordHash, salt, discriminator, avatar, createdAt);
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        const token = `token-${id}-${Date.now()}`;
        res.json({ user: { ...user, isAdmin: !!user.is_admin, isBot: !!user.is_bot, createdAt: user.created_at }, token });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "Registration failed. Email might be taken." });
    }
});

// Relationships
app.post('/api/friends/request', (req, res) => {
    const { fromUserId, toUsername } = req.body;
    const targetUser = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(toUsername);
    if (!targetUser) return res.status(404).json({ error: "Пользователь не найден" });
    if (targetUser.id === fromUserId) return res.status(400).json({ error: "Вы не можете добавить самого себя" });

    const existing = db.prepare(`SELECT * FROM relationships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`).get(fromUserId, targetUser.id, targetUser.id, fromUserId);
    if (existing) return res.status(400).json({ error: "Запрос уже отправлен или вы уже друзья" });

    const id = `rel-${Date.now()}`;
    db.prepare('INSERT INTO relationships (id, user_id_1, user_id_2, status, initiator_id) VALUES (?, ?, ?, ?, ?)')
      .run(id, fromUserId, targetUser.id, 'PENDING', fromUserId);

    res.json({ success: true, targetUser: { ...targetUser, createdAt: targetUser.created_at } });
});

app.post('/api/friends/accept', (req, res) => {
    const { userId, targetUserId } = req.body;
    const info = db.prepare(`UPDATE relationships SET status = 'FRIEND' WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)) AND status = 'PENDING'`).run(userId, targetUserId, targetUserId, userId);
    if (info.changes > 0) res.json({ success: true });
    else res.status(400).json({ error: "Запрос не найден" });
});

app.post('/api/friends/reject', (req, res) => {
    const { userId, targetUserId } = req.body;
    db.prepare(`DELETE FROM relationships WHERE ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?))`).run(userId, targetUserId, targetUserId, userId);
    res.json({ success: true });
});

app.get('/api/users/:userId/relationships', (req, res) => {
    const { userId } = req.params;
    const rels = db.prepare(`SELECT * FROM relationships WHERE user_id_1 = ? OR user_id_2 = ?`).all(userId, userId);
    res.json(rels);
});

// Servers
app.get('/api/servers', (req, res) => {
    const servers = db.prepare('SELECT * FROM servers').all();
    const result = servers.map(server => {
        const categories = db.prepare('SELECT * FROM categories WHERE serverId = ?').all(server.id);
        const channels = db.prepare('SELECT * FROM channels WHERE serverId = ?').all(server.id).map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            categoryId: c.categoryId,
            topic: c.topic,
            slowMode: c.slow_mode,
            ageRestricted: !!c.age_restricted,
            bitrate: c.bitrate || 64,
            userLimit: c.user_limit || 0,
            videoQuality: c.video_quality || 'AUTO',
            region: c.region
        }));
        
        // Fetch Members AND Roles
        const memberRows = db.prepare('SELECT userId, roles FROM server_members WHERE serverId = ?').all(server.id);
        const members = memberRows.map(m => m.userId);
        const memberRoles = {};
        memberRows.forEach(m => {
            memberRoles[m.userId] = JSON.parse(m.roles || '[]');
        });

        return {
            ...server,
            categories,
            channels,
            members,
            memberRoles,
            ownerId: server.owner_id || members[0],
            inviteCode: server.invite_code,
            bannerColor: server.banner_color,
            description: server.description,
            roles: JSON.parse(server.roles || '[]'),
            features: JSON.parse(server.features || '[]')
        };
    });
    res.json(result);
});

app.post('/api/servers', (req, res) => {
    const { name, ownerId, icon } = req.body;
    const serverId = `server-${Date.now()}`;
    const inviteCode = Math.random().toString(36).substring(2, 10);
    const defaultRoles = JSON.stringify([{ id: `${serverId}-everyone`, name: '@everyone', color: '#99AAB5', permissions: [] }]);
    
    const insertServer = db.prepare('INSERT INTO servers (id, name, icon, invite_code, roles, features, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertCat = db.prepare('INSERT INTO categories (id, serverId, name) VALUES (?, ?, ?)');
    const insertChannel = db.prepare('INSERT INTO channels (id, serverId, categoryId, name, type) VALUES (?, ?, ?, ?, ?)');
    const insertMember = db.prepare('INSERT INTO server_members (serverId, userId, roles) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        insertServer.run(serverId, name, icon || null, inviteCode, defaultRoles, '[]', ownerId);
        const cat1Id = `cat-${Date.now()}-1`;
        const cat2Id = `cat-${Date.now()}-2`;
        insertCat.run(cat1Id, serverId, 'Текстовые каналы');
        insertCat.run(cat2Id, serverId, 'Голосовые каналы');
        insertChannel.run(`ch-${Date.now()}-1`, serverId, cat1Id, 'general', 'TEXT');
        insertChannel.run(`ch-${Date.now()}-2`, serverId, cat2Id, 'Общий', 'VOICE');
        insertMember.run(serverId, ownerId, '["admin"]');
    });
    transaction();
    res.json({ id: serverId, name, icon: icon || null, inviteCode, ownerId, categories: [], channels: [], members: [ownerId], memberRoles: { [ownerId]: ['admin'] }, roles: JSON.parse(defaultRoles), features: [] });
});

app.put('/api/servers/:id', (req, res) => {
    const { id } = req.params;
    const { name, icon, description, bannerColor, roles, features } = req.body;
    const stmt = db.prepare(`UPDATE servers SET name = COALESCE(?, name), icon = COALESCE(?, icon), description = COALESCE(?, description), banner_color = COALESCE(?, banner_color), roles = COALESCE(?, roles), features = COALESCE(?, features) WHERE id = ?`);
    const info = stmt.run(name, icon, description, bannerColor, roles ? JSON.stringify(roles) : null, features ? JSON.stringify(features) : null, id);
    
    if (info.changes > 0) {
        const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(id);
        res.json({ ...server, roles: JSON.parse(server.roles || '[]'), features: JSON.parse(server.features || '[]') });
    } else {
        res.status(404).json({ error: "Server not found" });
    }
});

app.post('/api/servers/join', (req, res) => {
    const { inviteCode, userId } = req.body;
    const cleanCode = inviteCode.split('/').pop();
    const server = db.prepare('SELECT * FROM servers WHERE invite_code = ?').get(cleanCode);
    if (!server) return res.status(404).json({ error: "Сервер не найден" });
    
    const member = db.prepare('SELECT * FROM server_members WHERE serverId = ? AND userId = ?').get(server.id, userId);
    if (!member) db.prepare('INSERT INTO server_members (serverId, userId, roles) VALUES (?, ?, ?)').run(server.id, userId, '[]');
    res.json({ ...server, categories: [], channels: [], members: [], roles: [] });
});

app.post('/api/servers/:id/leave', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const info = db.prepare('DELETE FROM server_members WHERE serverId = ? AND userId = ?').run(id, userId);
    if (info.changes > 0) res.json({ success: true });
    else res.status(404).json({ error: "Not found" });
});

// Channels
app.post('/api/channels', (req, res) => {
    const { serverId, name, type, categoryId } = req.body;
    const id = `ch-${Date.now()}`;
    let finalCat = categoryId;
    if(!finalCat) {
        const cat = db.prepare('SELECT id FROM categories WHERE serverId = ? LIMIT 1').get(serverId);
        finalCat = cat ? cat.id : null;
    }
    db.prepare('INSERT INTO channels (id, serverId, categoryId, name, type) VALUES (?, ?, ?, ?, ?)').run(id, serverId, finalCat, name, type);
    res.json({ id, serverId, categoryId: finalCat, name, type });
});

app.put('/api/channels/:id', (req, res) => {
    const { id } = req.params;
    const { name, topic, slowMode, ageRestricted, bitrate, userLimit, videoQuality, region } = req.body;
    const stmt = db.prepare(`
        UPDATE channels 
        SET name = COALESCE(?, name),
            topic = COALESCE(?, topic),
            slow_mode = COALESCE(?, slow_mode),
            age_restricted = COALESCE(?, age_restricted),
            bitrate = COALESCE(?, bitrate),
            user_limit = COALESCE(?, user_limit),
            video_quality = COALESCE(?, video_quality),
            region = COALESCE(?, region)
        WHERE id = ?
    `);
    const info = stmt.run(name, topic, slowMode, ageRestricted ? 1 : 0, bitrate, userLimit, videoQuality, region, id);
    if (info.changes > 0) {
        const channel = db.prepare('SELECT * FROM channels WHERE id = ?').get(id);
        res.json({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            categoryId: channel.categoryId,
            topic: channel.topic,
            slowMode: channel.slow_mode,
            ageRestricted: !!channel.age_restricted,
            bitrate: channel.bitrate,
            userLimit: channel.user_limit,
            videoQuality: channel.video_quality,
            region: channel.region
        });
    } else {
        res.status(404).json({ error: "Channel not found" });
    }
});

app.delete('/api/channels/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM channels WHERE id = ?').run(id);
    res.json({ success: true });
});

// Messages
app.get('/api/channels/:id/messages', (req, res) => {
    const { id } = req.params;
    const msgs = db.prepare('SELECT * FROM messages WHERE channelId = ? ORDER BY timestamp ASC').all(id);
    const result = msgs.map(m => ({ ...m, attachments: JSON.parse(m.attachments || '[]') }));
    res.json(result);
});

app.post('/api/channels/:id/messages', (req, res) => {
    const { id } = req.params;
    const { authorId, content, attachments } = req.body;
    const msgId = `msg-${Date.now()}`;
    db.prepare('INSERT INTO messages (id, channelId, authorId, content, attachments) VALUES (?, ?, ?, ?, ?)')
      .run(msgId, id, authorId, content, attachments ? JSON.stringify(attachments) : null);
    res.json({ id: msgId, channelId: id, authorId, content, timestamp: new Date().toISOString(), attachments: attachments || [] });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
