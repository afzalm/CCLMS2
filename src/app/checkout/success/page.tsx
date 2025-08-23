"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle,
  BookOpen,
  Download,
  Award,
  Calendar,
  Clock,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Mail,
  CreditCard,
  IndianRupee
} from "lucide-react"

interface OrderDetails {
  id: string
  paymentMethod: string
  amount: number
  currency: string
  status: string
  courses: Array<{
    id: string
    title: string
    instructor: string
    thumbnail: string
    duration: string
    lectures: number
    level: string
    rating: number
  }>
  purchaseDate: string
  receipt?: string
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sessionId = searchParams.get('session_id')
  const paymentId = searchParams.get('payment_id')
  const method = searchParams.get('method') || 'stripe'

  useEffect(() => {
    // Simulate fetching order details
    // In production, you would fetch this from your backend
    const fetchOrderDetails = async () => {
      try {
        // Mock order data for demo
        const mockOrder: OrderDetails = {
          id: `ORD-${Date.now()}`,
          paymentMethod: method,
          amount: method === 'upi' ? 7470 : 89.99, // INR for UPI, USD for Stripe
          currency: method === 'upi' ? 'INR' : 'USD',
          status: 'completed',
          courses: [
            {
              id: "1",
              title: "Complete Web Development Bootcamp",
              instructor: "Dr. Sarah Chen",
              thumbnail: "/api/placeholder/200/120",
              duration: "52h 30m",
              lectures: 320,
              level: "Beginner",
              rating: 4.8
            }
          ],
          purchaseDate: new Date().toISOString(),
          receipt: sessionId || paymentId || undefined
        }

        // Simulate API delay
        setTimeout(() => {
          setOrderDetails(mockOrder)
          setIsLoading(false)
        }, 1500)

      } catch (error) {
        console.error('Error fetching order details:', error)
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId, paymentId, method])

  const handleStartLearning = (courseId: string) => {
    router.push(`/learn/courses/${courseId}`)
  }

  const handleDownloadReceipt = () => {
    // In production, this would download a PDF receipt
    alert('Receipt download feature would be implemented here')
  }

  const handleGoToDashboard = () => {
    router.push('/learn')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find your order details.</p>
            <Button onClick={() => router.push('/courses')}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CourseCompass
              </span>
            </div>
            <Button 
              onClick={handleGoToDashboard}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase. Your courses are now available.
            </p>
            <p className="text-gray-500">
              Order #{orderDetails.id} • {new Date(orderDetails.purchaseDate).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Purchased Courses */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your New Courses</h2>
              
              {orderDetails.courses.map((course) => (
                <Card key={course.id} className="border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-blue-600/50" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Enrolled</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">by {course.instructor}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{course.lectures} lectures</span>
                          </div>
                          <Badge className="bg-blue-600 text-white">{course.level}</Badge>
                        </div>
                        <Button 
                          onClick={() => handleStartLearning(course.id)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Start Learning
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* What's Next */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Start Learning</h4>
                      <p className="text-sm text-gray-600">Access your courses anytime, anywhere</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Earn Certificates</h4>
                      <p className="text-sm text-gray-600">Complete courses to get certified</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Join Community</h4>
                      <p className="text-sm text-gray-600">Connect with fellow learners</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {orderDetails.paymentMethod === 'upi' ? (
                        <IndianRupee className="h-4 w-4 text-orange-600" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="capitalize">{orderDetails.paymentMethod} Payment</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Courses:</span>
                        <span>{orderDetails.courses.length}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total Paid:</span>
                        <span className="text-green-600">
                          {orderDetails.currency === 'INR' ? '₹' : '$'}{orderDetails.amount}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Mobile & desktop</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      {orderDetails.receipt && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleDownloadReceipt}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Check Your Email</h4>
                    <p className="text-sm text-gray-600">
                      We've sent a confirmation email with your receipt and course access details.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}