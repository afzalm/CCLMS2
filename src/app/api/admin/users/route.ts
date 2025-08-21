import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Database } from 'sqlite3'
import path from 'path'

// Create a SQLite database connection
const dbPath = path.join(process.cwd(), 'src', 'lib', 'prisma', 'dev.db');

// Helper function to query the database
const queryDb = (sql: string, params: unknown[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath);
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// Helper function to run a query (for updates/deletes)
const runDb = (sql: string, params: unknown[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const db = new Database(dbPath);
    db.run(sql, params, function(err) {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
};

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'forbidden' }), {
      status: 403
    })
  }

  try {
    const users = await queryDb('SELECT * FROM User ORDER BY createdAt DESC')
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to fetch users' }), {
      status: 500
    })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'forbidden' }), {
      status: 403
    })
  }

  try {
    const { id, role } = await req.json()
    
    // Prevent users from changing their own role
    if (session.user.id === id) {
      return new NextResponse(JSON.stringify({ error: 'cannot change own role' }), {
        status: 400
      })
    }
    
    await runDb('UPDATE User SET role = ?, updatedAt = ? WHERE id = ?', [role, new Date().toISOString(), id])
    
    // Fetch the updated user
    const [updatedUser] = await queryDb('SELECT * FROM User WHERE id = ?', [id])
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to update user' }), {
      status: 500
    })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ error: 'forbidden' }), {
      status: 403
    })
  }

  try {
    const { id } = await req.json()
    
    // Prevent users from deleting themselves
    if (session.user.id === id) {
      return new NextResponse(JSON.stringify({ error: 'cannot delete own account' }), {
        status: 400
      })
    }
    
    await runDb('DELETE FROM User WHERE id = ?', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to delete user' }), {
      status: 500
    })
  }
}