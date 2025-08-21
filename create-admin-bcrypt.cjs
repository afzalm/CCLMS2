const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'src', 'lib', 'prisma', 'dev.db');

console.log('Database path:', dbPath);

// Generate a bcrypt hash
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Open the database
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  try {
    // Hash the password
    const hashedPassword = await hashPassword('admin123');

    // Admin user data
    const adminUser = {
      id: require('crypto').randomUUID(),
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if user already exists
    db.get('SELECT * FROM User WHERE email = ?', [adminUser.email], (err, row) => {
      if (err) {
        console.error('Error checking for existing user:', err.message);
        db.close();
        return;
      }

      if (row) {
        console.log('Admin user already exists. Updating password...');
        
        // Update the existing user's password
        db.run(
          'UPDATE User SET password = ? WHERE email = ?',
          [adminUser.password, adminUser.email],
          function(err) {
            if (err) {
              console.error('Error updating admin password:', err.message);
              db.close();
              return;
            }
            
            console.log(`Admin user password updated.`);
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
            
            // Verify the user was updated
            db.get('SELECT * FROM User WHERE email = ?', [adminUser.email], (err, row) => {
              if (err) {
                console.error('Error verifying admin user:', err.message);
                db.close();
                return;
              }
              
              console.log('Admin user verified in database:');
              console.log(row);
              db.close();
            });
          }
        );
      } else {
        // Insert new admin user
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
              db.close();
              return;
            }
            
            console.log(`Admin user created with ID: ${adminUser.id}`);
            console.log('Email: admin@example.com');
            console.log('Password: admin123');
            
            // Verify the user was created
            db.get('SELECT * FROM User WHERE email = ?', [adminUser.email], (err, row) => {
              if (err) {
                console.error('Error verifying admin user:', err.message);
                db.close();
                return;
              }
              
              console.log('Admin user verified in database:');
              console.log(row);
              db.close();
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    db.close();
  }
});