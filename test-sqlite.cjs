const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'src', 'lib', 'prisma', 'dev.db');

console.log('Database path:', dbPath);

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  // Query to get all users
  db.all('SELECT * FROM User LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return;
    }
    
    console.log('Users:');
    console.log(rows);
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        return;
      }
      console.log('Database connection closed.');
    });
  });
});