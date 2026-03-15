import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
const articles = db.prepare('SELECT id, title, content FROM articles LIMIT 1').all();
console.log('Before:', articles);

if (articles.length > 0) {
  const id = articles[0].id;
  try {
    const info = db.prepare('UPDATE articles SET title = ?, content = ? WHERE id = ?').run('Test Title', 'Test Content', id.toString());
    console.log('Update info:', info);
  } catch (e) {
    console.error('Update error:', e);
  }
  
  const after = db.prepare('SELECT id, title, content FROM articles WHERE id = ?').get(id);
  console.log('After:', after);
}
