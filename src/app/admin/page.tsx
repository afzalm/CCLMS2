"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  UserCheck,
  UserX
} from "lucide-react"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")

  // Mock admin data
  const platformStats = {
    totalUsers: 45230,
    totalCourses: 1240,
    totalRevenue: 894520,
    monthlyActiveUsers: 12450,
    pendingReviews: 23,
    flaggedContent: 8,
    supportTickets: 47
  }

  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "STUDENT",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-11-01",
      coursesEnrolled: 12,
      totalSpent: 456.80
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "INSTRUCTOR",
      status: "active",
      joinDate: "2023-11-20",
      lastActive: "2024-10-31",
      coursesCreated: 8,
      totalRevenue: 12450.00
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "STUDENT",
      status: "suspended",
      joinDate: "2024-02-10",
      lastActive: "2024-10-15",
      coursesEnrolled: 5,
      totalSpent: 234.50
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "INSTRUCTOR",
      status: "pending",
      joinDate: "2024-10-28",
      lastActive: "2024-10-28",
      coursesCreated: 0,
      totalRevenue: 0
    }
  ]

  const courses = [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      instructor: "Jane Smith",
      status: "published",
      students: 1542,
      revenue: 12360,
      rating: 4.8,
      created: "2024-01-15",
      lastUpdated: "2024-11-01"
    },
    {
      id: "2",
      title: "Advanced Python Programming",
      instructor: "Bob Davis",
      status: "pending_review",
      students: 0,
      revenue: 0,
      rating: 0,
      created: "2024-10-30",
      lastUpdated: "2024-10-30"
    },
    {
      id: "3",
      title: "Digital Marketing Masterclass",
      instructor: "Emma Wilson",
      status: "flagged",
      students: 234,
      revenue: 1872,
      rating: 3.2,
      created: "2024-09-15",
      lastUpdated: "2024-10-25"
    }
  ]

  const flaggedContent = [
    {
      id: "1",
      type: "course",
      title: "Digital Marketing Masterclass",
      reportedBy: "John Doe",
      reason: "Inappropriate content",
      severity: "high",
      reportedAt: "2024-10-31",
      status: "pending"
    },
    {
      id: "2",
      type: "review",
      title: "Review for Web Development Bootcamp",
      reportedBy: "Jane Smith",
      reason: "Spam content",
      severity: "medium",
      reportedAt: "2024-10-30",
      status: "under_review"
    },
    {
      id: "3",
      type: "user",
      title: "User: Mike Johnson",
      reportedBy: "Sarah Wilson",
      reason: "Harassment",
      severity: "high",
      reportedAt: "2024-10-29",
      status: "resolved"
    }
  ]

  const supportTickets = [
    {
      id: "1",
      user: "Alice Brown",
      subject: "Payment not processed",
      category: "billing",
      priority: "high",
      status: "open",
      created: "2024-11-01",
      assignedTo: "Support Team"
    },
    {
      id: "2",
      user: "Bob Davis",
      subject: "Course access issue",
      category: "technical",
      priority: "medium",
      status: "in_progress",
      created: "2024-10-31",
      assignedTo: "Tech Support"
    },
    {
      id: "3",
      user: "Carol White",
      subject: "Refund request",
      category: "billing",
      priority: "low",
      status: "resolved",
      created: "2024-10-30",
      assignedTo: "Billing Team"
    }
  ]

  const revenueData = [
    { month: "Jun", revenue: 125000 },
    { month: "Jul", revenue: 142000 },
    { month: "Aug", revenue: 138000 },
    { month: "Sep", revenue: 156000 },
    { month: "Oct", revenue: 168000 },
    { month: "Nov", revenue: 149000 }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || 
                         userFilter === user.role.toLowerCase() ||
                         userFilter === user.status
    return matchesSearch && matchesFilter
  })

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = courseFilter === "all" || courseFilter === course.status
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "published":
        return <Badge className="bg-green-600">Active</Badge>
      case "pending":
      case "pending_review":
        return <Badge className="bg-yellow-600">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-600">Suspended</Badge>
      case "flagged":
        return <Badge className="bg-orange-600">Flagged</Badge>
      case "resolved":
        return <Badge className="bg-green-600">Resolved</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-600">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-600">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-600">Low</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">Admin Portal</span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-sm font-medium hover:text-primary">Platform</a>
                <a href="/admin" className="text-sm font-medium text-primary">Admin</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Settings</Button>
              <Button>Log Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, content, and platform operations</p>
        </div>

        {/* Platform Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% from last month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{platformStats.totalCourses.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${platformStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                  <p className="text-2xl font-bold">
                    {platformStats.pendingReviews + platformStats.flaggedContent + platformStats.supportTickets}
                  </p>
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Requires attention
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Revenue</CardTitle>
                  <CardDescription>Monthly revenue for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between h-32">
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-primary rounded-t"
                            style={{ height: `${(item.revenue / 200000) * 100}%` }}
                          />
                          <span className="text-xs mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        ${revenueData[revenueData.length - 1].revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <UserCheck className="h-6 w-6 mb-2" />
                      <span className="text-sm">Approve Users</span>
                      <Badge className="mt-1">{users.filter(u => u.status === "pending").length}</Badge>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span className="text-sm">Review Courses</span>
                      <Badge className="mt-1">{courses.filter(c => c.status === "pending_review").length}</Badge>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <AlertTriangle className="h-6 w-6 mb-2" />
                      <span className="text-sm">Flagged Content</span>
                      <Badge className="mt-1">{flaggedContent.filter(f => f.status === "pending").length}</Badge>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span className="text-sm">Support Tickets</span>
                      <Badge className="mt-1">{supportTickets.filter(s => s.status === "open").length}</Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600 mb-2">
                      {platformStats.pendingReviews}
                    </p>
                    <p className="text-sm text-muted-foreground">Courses awaiting approval</p>
                    <Button size="sm" className="mt-3">Review Now</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flagged Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600 mb-2">
                      {platformStats.flaggedContent}
                    </p>
                    <p className="text-sm text-muted-foreground">Items requiring moderation</p>
                    <Button size="sm" className="mt-3">Moderate</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {platformStats.supportTickets}
                    </p>
                    <p className="text-sm text-muted-foreground">Open support requests</p>
                    <Button size="sm" className="mt-3">View All</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="instructor">Instructors</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{user.role}</Badge>
                            {getStatusBadge(user.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Joined: {user.joinDate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last active: {user.lastActive}
                        </p>
                        {user.role === "STUDENT" && (
                          <p className="text-sm font-medium">
                            {user.coursesEnrolled} courses • ${user.totalSpent}
                          </p>
                        )}
                        {user.role === "INSTRUCTOR" && (
                          <p className="text-sm font-medium">
                            {user.coursesCreated} courses • ${user.totalRevenue.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {user.status === "active" ? (
                          <Button size="sm" variant="outline">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Review and manage all courses on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses by title or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(course.status)}
                            {course.rating > 0 && (
                              <span className="text-sm">★ {course.rating}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Created: {course.created}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Updated: {course.lastUpdated}
                        </p>
                        <p className="text-sm font-medium">
                          {course.students} students • ${course.revenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        {course.status === "pending_review" && (
                          <Button size="sm">Review</Button>
                        )}
                        {course.status === "flagged" && (
                          <Button size="sm" variant="outline">Moderate</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Manage flagged content and user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reported by {item.reportedBy} • {item.reportedAt}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{item.type}</Badge>
                            {getPriorityBadge(item.severity)}
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {item.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {item.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-3 w-3 mr-1" />
                              Dismiss
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve Action
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage user support requests and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {ticket.user} • {ticket.created}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{ticket.category}</Badge>
                            {getPriorityBadge(ticket.priority)}
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Assigned to: {ticket.assignedTo}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        {ticket.status === "open" && (
                          <Button size="sm">Take Ownership</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}