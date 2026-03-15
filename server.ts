import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// Setup SQLite Database
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'read',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    featured_image TEXT,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS galleries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_title TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    facebook_link TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    html_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Handle migrations for existing DB
try { db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'read'`); } catch (e) {}
try { db.exec(`ALTER TABLE articles ADD COLUMN category_id INTEGER REFERENCES categories(id)`); } catch (e) {}

// Seed default admin user if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
} else {
  db.prepare('UPDATE users SET role = ? WHERE username = ?').run('admin', 'admin');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authorize = (requiredPermission: string) => {
  return (req: any, res: any, next: any) => {
    const userRole = req.user.role || '';
    if (userRole === 'admin') return next();
    const permissions = userRole.split(',');
    if (permissions.includes(requiredPermission)) return next();
    res.status(403).json({ error: 'Forbidden' });
  };
};

// --- API ROUTES ---
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// Users (Admin only)
app.get('/api/users', authenticateToken, authorize('admin'), (req, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.post('/api/users', authenticateToken, authorize('admin'), (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const info = stmt.run(username, hash, role || 'read');
    res.json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: 'Username may already exist' });
  }
});

app.put('/api/users/:id', authenticateToken, authorize('admin'), (req, res) => {
  const { role, password } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET role = ?, password_hash = ? WHERE id = ?').run(role, hash, req.params.id);
  } else {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  }
  res.json({ success: true });
});

app.delete('/api/users/:id', authenticateToken, authorize('admin'), (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare(`
    SELECT 
      c.*, 
      (SELECT COUNT(*) FROM categories sub WHERE sub.parent_id = c.id) as subcategory_count,
      (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) as article_count
    FROM categories c 
    ORDER BY c.name ASC
  `).all();
  res.json(categories);
});

app.post('/api/categories', authenticateToken, authorize('create'), (req, res) => {
  const { name, parent_id } = req.body;
  const stmt = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
  const info = stmt.run(name, parent_id || null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/categories/:id', authenticateToken, authorize('update'), (req, res) => {
  const { name, parent_id } = req.body;
  db.prepare('UPDATE categories SET name = ?, parent_id = ? WHERE id = ?').run(name, parent_id || null, req.params.id);
  res.json({ success: true });
});

app.delete('/api/categories/:id', authenticateToken, authorize('delete'), (req, res) => {
  const subcategoryCount = db.prepare('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?').get(req.params.id) as { count: number };
  if (subcategoryCount.count > 0) {
    return res.status(400).json({ error: 'Cannot delete category with sub-categories' });
  }

  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles WHERE category_id = ?').get(req.params.id) as { count: number };
  if (articleCount.count > 0) {
    return res.status(400).json({ error: 'Cannot delete category with linked articles' });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Articles
app.get('/api/articles', (req, res) => {
  const articles = db.prepare(`
    SELECT articles.*, categories.name as category_name 
    FROM articles 
    LEFT JOIN categories ON articles.category_id = categories.id 
    ORDER BY articles.created_at DESC
  `).all();
  res.json(articles);
});

app.post('/api/articles', authenticateToken, authorize('create'), (req, res) => {
  const { title, content, author, featured_image, category_id } = req.body;
  const stmt = db.prepare('INSERT INTO articles (title, content, author, featured_image, category_id) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(title, content, author, featured_image, category_id || null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/articles/:id', authenticateToken, authorize('update'), (req, res) => {
  try {
    const { title, content, author, featured_image, category_id } = req.body;
    db.prepare('UPDATE articles SET title = ?, content = ?, author = ?, featured_image = ?, category_id = ? WHERE id = ?')
      .run(title, content, author, featured_image, category_id || null, req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/articles/:id', authenticateToken, authorize('delete'), (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Events
app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY event_date ASC').all();
  res.json(events);
});

app.post('/api/events', authenticateToken, authorize('create'), (req, res) => {
  const { name, event_date, location, description } = req.body;
  const stmt = db.prepare('INSERT INTO events (name, event_date, location, description) VALUES (?, ?, ?, ?)');
  const info = stmt.run(name, event_date, location, description);
  res.json({ id: info.lastInsertRowid });
});

app.delete('/api/events/:id', authenticateToken, authorize('delete'), (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Galleries
app.get('/api/galleries', (req, res) => {
  const galleries = db.prepare('SELECT * FROM galleries ORDER BY created_at DESC').all();
  res.json(galleries);
});

app.post('/api/galleries', authenticateToken, authorize('create'), (req, res) => {
  const { album_title, cover_image_url, facebook_link } = req.body;
  const stmt = db.prepare('INSERT INTO galleries (album_title, cover_image_url, facebook_link) VALUES (?, ?, ?)');
  const info = stmt.run(album_title, cover_image_url, facebook_link);
  res.json({ id: info.lastInsertRowid });
});

app.delete('/api/galleries/:id', authenticateToken, authorize('delete'), (req, res) => {
  db.prepare('DELETE FROM galleries WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Documents (Word Import)
const upload = multer({ storage: multer.memoryStorage() });

// Image Uploads
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});
const uploadImage = multer({ storage: imageStorage });

app.post('/api/images/upload', authenticateToken, authorize('create'), uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.get('/api/images', authenticateToken, (req, res) => {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) return res.json([]);
  
  const files = fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => ({
      url: `/uploads/${f}`,
      name: f,
      time: fs.statSync(path.join(dir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .map(f => f.url);
    
  res.json(files);
});

app.post('/api/documents/upload', authenticateToken, authorize('create'), upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const title = req.body.title || req.file.originalname;

  try {
    const result = await mammoth.convertToHtml({ buffer: req.file.buffer });
    const html = result.value; // The generated HTML
    
    const stmt = db.prepare('INSERT INTO documents (title, html_content) VALUES (?, ?)');
    const info = stmt.run(title, html);
    
    res.json({ id: info.lastInsertRowid, title, html });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

app.get('/api/documents', (req, res) => {
  const docs = db.prepare('SELECT id, title, created_at FROM documents ORDER BY created_at DESC').all();
  res.json(docs);
});

app.get('/api/documents/:id', (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.delete('/api/documents/:id', authenticateToken, authorize('delete'), (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});


// Vite Integration
async function startServer() {
  // Serve uploads folder statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
