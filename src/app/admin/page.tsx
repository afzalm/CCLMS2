"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  UserX,
  LogOut,
  User
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [platformStats, setPlatformStats] = useState<any>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyActiveUsers: 0,
    pendingReviews: 0,
    flaggedContent: 0,
    supportTickets: 0,
    userGrowth: 0,
    courseGrowth: 0,
    revenueGrowth: 0,
    revenueData: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 10
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseCurrentPage, setCourseCurrentPage] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  const coursesPerPage = 10

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    // Fetch admin overview data
    fetchAdminOverview()
  }, [])

  const fetchAdminOverview = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        router.push('/auth/login')
        return
      }

      const userData = JSON.parse(storedUser)
      if (userData.role !== 'ADMIN') {
        router.push('/')
        return
      }

      const response = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlatformStats(data.data)
      } else if (response.status === 401) {
        // Unauthorized, redirect to login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        router.push('/auth/login')
      } else {
        console.error('Failed to fetch admin overview data')
      }
    } catch (error) {
      console.error('Error fetching admin overview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    console.log('Admin logout clicked')
    try {
      // Clear local storage immediately
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Call logout API (optional, for server-side cleanup)
      fetch('/api/auth/logout', {
        method: 'POST',
      }).catch(err => console.log('Logout API error:', err))
      
      // Redirect to home page immediately
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, still redirect
      window.location.href = '/'
    }
  }

  // Fetch users data
  const fetchUsers = async (page = 1, search = '', filter = 'all') => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPerPage.toString(),
        search,
        filter
      })
      
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalUsers(data.total)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Handle user status updates
  const handleUserStatusUpdate = async (userId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          action: status === 'active' ? 'suspend' : 'activate'
        })
      })
      
      if (response.ok) {
        // Refresh users list
        fetchUsers(currentPage, searchTerm, userFilter)
        // Show success message
        alert(`User ${status === 'active' ? 'suspended' : 'activated'} successfully`)
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status')
    }
  }

  // Fetch courses data
  const fetchCourses = async (page = 1, search = '', filter = 'all') => {
    setCoursesLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: coursesPerPage.toString(),
        search,
        status: filter
      })
      
      const response = await fetch(`/api/admin/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setTotalCourses(data.total)
      } else {
        console.error('Failed to fetch courses')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  // Handle course actions (approve, reject, flag, etc.)
  const handleCourseAction = async (courseId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          action
        })
      })
      
      if (response.ok) {
        // Refresh courses list
        fetchCourses(courseCurrentPage, searchTerm, courseFilter)
        // Show success message
        alert(`Course ${action}d successfully`)
      } else {
        alert(`Failed to ${action} course`)
      }
    } catch (error) {
      console.error(`Error ${action}ing course:`, error)
      alert(`Error ${action}ing course`)
    }
  }

  // Fetch users when component mounts or filters change
  useEffect(() => {
    if (mounted) {
      fetchUsers(currentPage, searchTerm, userFilter)
    }
  }, [mounted, currentPage, searchTerm, userFilter])

  // Debounced search for better performance
  useEffect(() => {
    if (mounted) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1) // Reset to first page when searching
        fetchUsers(1, searchTerm, userFilter)
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, userFilter, mounted])

  // Fetch courses when component mounts or filters change
  useEffect(() => {
    if (mounted) {
      fetchCourses(courseCurrentPage, searchTerm, courseFilter)
    }
  }, [mounted, courseCurrentPage])

  // Debounced search for courses
  useEffect(() => {
    if (mounted) {
      const timeoutId = setTimeout(() => {
        setCourseCurrentPage(1) // Reset to first page when searching
        fetchCourses(1, searchTerm, courseFilter)
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, courseFilter, mounted])

  // Consistent number formatting function
  const formatNumber = (num: number) => {
    if (!mounted) return num.toString() // Prevent hydration mismatch
    return new Intl.NumberFormat('en-US').format(num)
  }

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

  const revenueData = platformStats.revenueData || [
    { month: "Jun", revenue: 125000 },
    { month: "Jul", revenue: 142000 },
    { month: "Aug", revenue: 138000 },
    { month: "Sep", revenue: 156000 },
    { month: "Oct", revenue: 168000 },
    { month: "Nov", revenue: 149000 }
  ]

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
                <a href="/admin/sso-settings" className="text-sm font-medium hover:text-primary flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  SSO Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name || 'Admin User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault()
                      router.push('/profile')
                    }}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('Settings clicked')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault()
                      console.log('Admin logout menu item clicked')
                      handleLogout()
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <p className="text-2xl font-bold">{formatNumber(platformStats.totalUsers)}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{platformStats.userGrowth}% from last month
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
                  <p className="text-2xl font-bold">{formatNumber(platformStats.totalCourses)}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{platformStats.courseGrowth}% from last month
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
                  <p className="text-2xl font-bold">${formatNumber(platformStats.totalRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{platformStats.revenueGrowth}% from last month
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
                        ${formatNumber(revenueData[revenueData.length - 1].revenue)}
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
                      <Badge className="mt-1">{platformStats.pendingUsers || 0}</Badge>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span className="text-sm">Review Courses</span>
                      <Badge className="mt-1">{platformStats.pendingReviews || 0}</Badge>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => router.push('/admin/sso-settings')}
                    >
                      <Settings className="h-6 w-6 mb-2" />
                      <span className="text-sm">SSO Settings</span>
                      <span className="text-xs text-muted-foreground mt-1">Manage OAuth</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col"
                      onClick={() => router.push('/admin/payment-settings')}
                    >
                      <CreditCard className="h-6 w-6 mb-2" />
                      <span className="text-sm">Payment Settings</span>
                      <span className="text-xs text-muted-foreground mt-1">Gateway Config</span>
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
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading users...</p>
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No users found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            ) : (
                              <Users className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{user.name || 'Unknown User'}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{user.role}</Badge>
                              {getStatusBadge(user.status)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last active: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {user.role === "STUDENT" && (
                            <p className="text-sm font-medium">
                              {user.enrollmentCount || 0} courses • ${formatNumber(user.totalSpent || 0)}
                            </p>
                          )}
                          {user.role === "TRAINER" && (
                            <p className="text-sm font-medium">
                              {user.courseCount || 0} courses • ${formatNumber(user.totalRevenue || 0)}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {user.status === "active" ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (confirm('Are you sure you want to suspend this user?')) {
                                  handleUserStatusUpdate(user.id, user.status)
                                }
                              }}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (confirm('Are you sure you want to activate this user?')) {
                                  handleUserStatusUpdate(user.id, user.status)
                                }
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                {!usersLoading && users.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {Math.ceil(totalUsers / usersPerPage)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalUsers / usersPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
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
                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading courses...</p>
                      </div>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No courses found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                  ) : (
                    courses.map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="w-16 h-12 rounded object-cover" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">by {course.trainer?.name || 'Unknown Instructor'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusBadge(course.status)}
                              {course.averageRating > 0 && (
                                <span className="text-sm flex items-center">
                                  ★ {Number(course.averageRating).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Updated: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-sm font-medium">
                            {course.enrollmentCount || 0} students • ${formatNumber(course.totalRevenue || 0)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/courses/${course.id}`, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          {course.status === "PUBLISHED" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (confirm('Are you sure you want to flag this course?')) {
                                  handleCourseAction(course.id, 'flag')
                                }
                              }}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Flag
                            </Button>
                          )}
                          {course.status === "DRAFT" && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to approve this course for publication?')) {
                                  handleCourseAction(course.id, 'approve')
                                }
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          {course.status === "FLAGGED" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  if (confirm('Are you sure you want to unflag this course?')) {
                                    handleCourseAction(course.id, 'unflag')
                                  }
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Unflag
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to reject this course? This action cannot be undone.')) {
                                    handleCourseAction(course.id, 'reject')
                                  }
                                }}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                {!coursesLoading && courses.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((courseCurrentPage - 1) * coursesPerPage) + 1} to {Math.min(courseCurrentPage * coursesPerPage, totalCourses)} of {totalCourses} courses
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCourseCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={courseCurrentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {courseCurrentPage} of {Math.ceil(totalCourses / coursesPerPage)}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCourseCurrentPage(prev => prev + 1)}
                        disabled={courseCurrentPage >= Math.ceil(totalCourses / coursesPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
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