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
    // Fetch summary data using direct SQL queries
    const [totalUsersResult] = await queryDb('SELECT COUNT(*) as count FROM User')
    const totalUsers = totalUsersResult.count || 0

    const [pendingCoursesResult] = await queryDb('SELECT COUNT(*) as count FROM Course WHERE status = ?', ['PENDING'])
    const pendingCourses = pendingCoursesResult?.count || 0

    const [totalPaymentsResult] = await queryDb('SELECT COUNT(*) as count FROM Payment')
    const totalPayments = totalPaymentsResult?.count || 0

    // Calculate date for 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [recentPaymentsResult] = await queryDb('SELECT COUNT(*) as count FROM Payment WHERE createdAt >= ?', [sevenDaysAgo])
    const recentPayments = recentPaymentsResult?.count || 0
    
    const summary = {
      totalUsers,
      pendingCourses,
      totalPayments,
      recentPayments
    }
    
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return new NextResponse(JSON.stringify({ error: 'failed to fetch dashboard summary' }), {
      status: 500
    })
  }
}