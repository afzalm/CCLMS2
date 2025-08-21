const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'src', 'lib', 'prisma', 'dev.db');

console.log('Database path:', dbPath);

// Simple password hashing function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Admin user data
const adminUser = {
  id: crypto.randomUUID(),
  name: 'Admin User',
  email: 'admin@example.com',
  password: hashPassword('admin123'),
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  // Insert admin user
  const insertSql = `
    INSERT INTO User (id, name, email, password, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(
    insertSql,
    [
      adminUser.id,
      adminUser.name,
      adminUser.email,
      adminUser.password,
      adminUser.role,
      adminUser.createdAt,
      adminUser.updatedAt
    ],
    function(err) {
      if (err) {
        console.error('Error inserting admin user:', err.message);
        return;
      }
      
      console.log(`Admin user created with ID: ${adminUser.id}`);
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      
      // Verify the user was created
      db.get('SELECT * FROM User WHERE email = ?', [adminUser.email], (err, row) => {
        if (err) {
          console.error('Error verifying admin user:', err.message);
          return;
        }
        
        console.log('Admin user verified in database:');
        console.log(row);
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            return;
          }
          console.log('Database connection closed.');
        });
      });
    }
  );
});