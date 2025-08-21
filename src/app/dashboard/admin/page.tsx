'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface SummaryData {
  totalUsers: number;
  pendingCourses: number;
  totalPayments: number;
  recentPayments: number;
}

const AdminDashboard = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/admin/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard summary');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError('Failed to load dashboard summary');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {summary && (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>{summary.totalUsers}</h2>
            <p>Total Users</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>{summary.pendingCourses}</h2>
            <p>Pending Courses</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>{summary.totalPayments}</h2>
            <p>Total Payments</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>{summary.recentPayments}</h2>
            <p>Recent Payments (7 days)</p>
          </div>
        </div>
      )}
      
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'space-around' }}>
          <li>
            <Link href="/dashboard/admin/user-management" style={{ 
              padding: '10px 20px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}>
              User Management
            </Link>
          </li>
          <li>
            <Link href="/dashboard/admin/course-approval" style={{ 
              padding: '10px 20px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}>
              Course Approval
            </Link>
          </li>
          <li>
            <Link href="/dashboard/admin/payment-monitoring" style={{ 
              padding: '10px 20px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}>
              Payment Monitoring
            </Link>
          </li>
        </ul>
      </nav>
      
      <main style={{ marginTop: '30px' }}>
        <h2>Quick Actions</h2>
        <ul>
          <li><Link href="/dashboard/admin/user-management">Manage Users</Link></li>
          <li><Link href="/dashboard/admin/course-approval">Approve Courses</Link></li>
          <li><Link href="/dashboard/admin/payment-monitoring">Monitor Payments</Link></li>
        </ul>
      </main>
    </div>
  );
};

export default AdminDashboard;