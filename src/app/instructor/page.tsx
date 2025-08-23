"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star,
  Clock,
  Play,
  Plus,
  BarChart3,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Settings
} from "lucide-react"

export default function InstructorDashboard() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

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
  }, [])

  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/instructor/courses?instructorId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setCourses(data.data.courses)
          setStats(data.data.stats)
        } else {
          console.error('Failed to fetch instructor data')
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructorData()
  }, [user])

  const handleLogout = async () => {
    console.log('Instructor logout clicked')
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

  // Use real data from API, fallback to defaults for display
  const instructorStats = {
    totalStudents: stats.totalStudents || 0,
    totalCourses: stats.totalCourses || 0,
    totalRevenue: stats.totalRevenue || 0,
    averageRating: stats.averageRating || 0,
    monthlyRevenue: Math.round((stats.totalRevenue || 0) / 12), // Rough monthly estimate
    completionRate: stats.completionRate || 0
  }

  // Consistent number formatting function
  const formatNumber = (num: number) => {
    if (!mounted) return num.toString() // Prevent hydration mismatch
    return new Intl.NumberFormat('en-US').format(num)
  }

  // courses is now loaded from API via useState

  const revenueData = [
    { month: "Jan", revenue: 2800 },
    { month: "Feb", revenue: 3200 },
    { month: "Mar", revenue: 3600 },
    { month: "Apr", revenue: 3400 },
    { month: "May", revenue: 4100 },
    { month: "Jun", revenue: 3840 }
  ]

  const studentEngagement = [
    { day: "Mon", active: 240 },
    { day: "Tue", active: 320 },
    { day: "Wed", active: 280 },
    { day: "Thu", active: 350 },
    { day: "Fri", active: 310 },
    { day: "Sat", active: 180 },
    { day: "Sun", active: 150 }
  ]

  const recentActivity = [
    {
      id: "1",
      type: "enrollment",
      course: "Complete Web Development Bootcamp",
      student: "John Doe",
      timestamp: "2 minutes ago"
    },
    {
      id: "2",
      type: "review",
      course: "Advanced React and Redux",
      student: "Jane Smith",
      rating: 5,
      timestamp: "15 minutes ago"
    },
    {
      id: "3",
      type: "completion",
      course: "Python for Data Analysis",
      student: "Mike Johnson",
      timestamp: "1 hour ago"
    },
    {
      id: "4",
      type: "question",
      course: "Complete Web Development Bootcamp",
      student: "Sarah Wilson",
      timestamp: "2 hours ago"
    }
  ]

  const atRiskStudents = [
    {
      id: "1",
      name: "Alice Brown",
      course: "Complete Web Development Bootcamp",
      progress: 15,
      lastActive: "5 days ago",
      email: "alice@example.com"
    },
    {
      id: "2",
      name: "Bob Davis",
      course: "Advanced React and Redux",
      progress: 8,
      lastActive: "7 days ago",
      email: "bob@example.com"
    },
    {
      id: "3",
      name: "Carol White",
      course: "Python for Data Analysis",
      progress: 22,
      lastActive: "3 days ago",
      email: "carol@example.com"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">CourseCompass</span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-sm font-medium hover:text-primary">Home</a>
                <a href="/courses" className="text-sm font-medium hover:text-primary">Browse Courses</a>
                <a href="/instructor" className="text-sm font-medium text-primary">Instructor Dashboard</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'I'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
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
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault()
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track your performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => router.push('/instructor/create-course')}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{formatNumber(instructorStats.totalStudents)}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${formatNumber(instructorStats.totalRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% from last month
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
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{instructorStats.averageRating}</p>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-xs text-muted-foreground">across all courses</span>
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{instructorStats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">above platform average</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Your monthly revenue for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between h-32">
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-primary rounded-t"
                            style={{ height: `${(item.revenue / 5000) * 100}%` }}
                          />
                          <span className="text-xs mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">${formatNumber(instructorStats.monthlyRevenue)}</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription>Daily active students this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between h-32">
                      {studentEngagement.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-600 rounded-t"
                            style={{ height: `${(item.active / 400) * 100}%` }}
                          />
                          <span className="text-xs mt-2">{item.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {studentEngagement.reduce((sum, item) => sum + item.active, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total active students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === "enrollment" && <Users className="h-5 w-5 text-blue-600" />}
                        {activity.type === "review" && <Star className="h-5 w-5 text-yellow-600" />}
                        {activity.type === "completion" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {activity.type === "question" && <MessageSquare className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.student}</span>
                          {activity.type === "enrollment" && " enrolled in "}
                          {activity.type === "review" && " rated "}
                          {activity.type === "completion" && " completed "}
                          {activity.type === "question" && " asked a question in "}
                          <span className="font-medium">{activity.course}</span>
                          {activity.type === "review" && (
                            <span className="text-yellow-600"> ★{activity.rating}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2 mb-1">{course.title}</h3>
                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{formatNumber(course.students)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>${formatNumber(course.revenue)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span>{course.completionRate}%</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-3">Last updated: {course.lastUpdated}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>Detailed analytics for each course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <span className="text-sm text-muted-foreground">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{course.students} students</span>
                          <span>${course.revenue} revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Distribution</CardTitle>
                  <CardDescription>How students are progressing through your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">0-25% Complete</span>
                        <span className="text-sm text-muted-foreground">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">26-50% Complete</span>
                        <span className="text-sm text-muted-foreground">31%</span>
                      </div>
                      <Progress value={31} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">51-75% Complete</span>
                        <span className="text-sm text-muted-foreground">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">76-100% Complete</span>
                        <span className="text-sm text-muted-foreground">18%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>At-Risk Students</CardTitle>
                  <CardDescription>Students who may need additional support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {atRiskStudents.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{student.name}</h4>
                            <span className="text-xs text-red-600">{student.progress}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{student.course}</p>
                          <p className="text-xs text-red-600">Last active: {student.lastActive}</p>
                        </div>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students with exceptional progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Emma Wilson", course: "Complete Web Development Bootcamp", progress: 95, completionTime: "3 weeks" },
                      { name: "David Chen", course: "Advanced React and Redux", progress: 88, completionTime: "4 weeks" },
                      { name: "Lisa Anderson", course: "Python for Data Analysis", progress: 92, completionTime: "2 weeks" }
                    ].map((student, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{student.name}</h4>
                            <span className="text-xs text-green-600">{student.progress}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{student.course}</p>
                          <p className="text-xs text-green-600">Completed in: {student.completionTime}</p>
                        </div>
                        <Button size="sm" variant="outline">Message</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}