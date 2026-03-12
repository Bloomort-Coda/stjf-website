import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

// Insert categories
const insertCategory = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
const getCategory = db.prepare('SELECT id FROM categories WHERE name = ? AND parent_id IS ?');

let servicesCat = getCategory.get('Services', null);
if (!servicesCat) {
  const info = insertCategory.run('Services', null);
  servicesCat = { id: info.lastInsertRowid };
}

let homeCat = getCategory.get('Home', null);
if (!homeCat) {
  const info = insertCategory.run('Home', null);
  homeCat = { id: info.lastInsertRowid };
}

let aboutUsCat = getCategory.get('About us', homeCat.id);
if (!aboutUsCat) {
  const info = insertCategory.run('About us', homeCat.id);
  aboutUsCat = { id: info.lastInsertRowid };
}

// Insert articles
const insertArticle = db.prepare('INSERT INTO articles (title, content, author, category_id) VALUES (?, ?, ?, ?)');

const massTimesContent = `
<h2>Morning prayers</h2>
<p>Tuesday - Wednesday - Thursday - Friday - 08H00am - Rosary.</p>
<h2>Holy Mass</h2>
<p>Tuesday - Wednesday - Thursday - Friday - 08.30am</p>
<h2>Weekend Masses</h2>
<p>Saturday - 17h00</p>
<p>Sunday - 07H30; 10h00; 17h00</p>
<p><strong>HOLY HOUR AND ADORATION AND HOLY MASS @ 17H00 IN THE CHURCH. THIS WILL TAKE PLACE EVERY 1ST FRIDAY OF THE MONTH.</strong></p>
<h2>Sacrament of Confession</h2>
<p>Father Thomas is available before or after morning Mass (Tuesdays to Fridays) and on a Saturday afternoon from 16h00. NO BOOKINGS ARE NECESSARY DURING THESE PERIODS. Please ensure Father Thomas knows you are there to receive the Sacrament of Reconciliation. If you cannot make these times you are welcome to make an appointment with the parish office.</p>
<h2>Sacraments</h2>
<p><strong>Sacrament of Marriage</strong> - Notice has to be given at least six months before receiving the Sacrament of Marriage.</p>
<p><strong>Sacrament of Baptism</strong> - Notice has to be given at least one month before the Sacrament.</p>
`;

const aboutUsContent = `
<p>We serve the Catholic community of Lynnwood and Pretoria East. Our church is always open and ready to receive guests, visitors as well as our regular parishioners. This church opened its doors in 1961 and celebrated its half century in 2011. We continue to strive to be a church where everyone can experience the love of God. All are encouraged to learn about, and practice their faith amongst fellow Catholics and in the wider community.</p>
`;

const info1 = insertArticle.run('Mass Times', massTimesContent, 'admin', servicesCat.id);
const massTimesId = info1.lastInsertRowid;

const info2 = insertArticle.run('About Our Parish', aboutUsContent, 'admin', aboutUsCat.id);
const aboutUsId = info2.lastInsertRowid;

console.log(JSON.stringify({ massTimesId, aboutUsId }));
