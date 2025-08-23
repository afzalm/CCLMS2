"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  ArrowLeft, 
  Upload, 
  Plus, 
  X, 
  Save, 
  Eye, 
  Settings,
  DollarSign,
  Users,
  Clock,
  Target,
  FileText,
  Video,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [courseData, setCourseData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "",
    language: "English",
    price: "",
    thumbnail: null as File | null,
    learningObjectives: [""],
    requirements: [""],
    targetAudience: ""
  })

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Redirect to login if no user
      router.push('/auth/login')
    }
  }, [])

  const [chapters, setChapters] = useState([
    {
      id: "1",
      title: "",
      lessons: [
        {
          id: "1-1",
          title: "",
          description: "",
          videoFile: null as File | null,
          duration: "",
          resources: []
        }
      ]
    }
  ])

  const categories = [
    "Web Development",
    "Data Science", 
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
    "Health & Fitness"
  ]

  const levels = ["Beginner", "Intermediate", "Advanced"]

  const handleInputChange = (field: string, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: "learningObjectives" | "requirements", index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: "learningObjectives" | "requirements") => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeArrayItem = (field: "learningObjectives" | "requirements", index: number) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const addChapter = () => {
    const newChapter = {
      id: (chapters.length + 1).toString(),
      title: "",
      lessons: [
        {
          id: `${chapters.length + 1}-1`,
          title: "",
          description: "",
          videoFile: null as File | null,
          duration: "",
          resources: []
        }
      ]
    }
    setChapters([...chapters, newChapter])
  }

  const addLesson = (chapterIndex: number) => {
    const updatedChapters = [...chapters]
    const chapterLessons = updatedChapters[chapterIndex].lessons
    const newLesson = {
      id: `${chapterIndex + 1}-${chapterLessons.length + 1}`,
      title: "",
      description: "",
      videoFile: null as File | null,
      duration: "",
      resources: []
    }
    updatedChapters[chapterIndex].lessons.push(newLesson)
    setChapters(updatedChapters)
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCourseData(prev => ({ ...prev, thumbnail: file }))
    }
  }

  const handleSaveDraft = async () => {
    if (!user?.id) {
      alert("Please log in to save your course")
      return
    }

    setIsLoading(true)
    try {
      const draftData = {
        id: courseId,
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level.toUpperCase(),
        language: courseData.language,
        price: parseFloat(courseData.price) || 0,
        trainerId: user.id,
        learningObjectives: courseData.learningObjectives.filter(obj => obj.trim()),
        requirements: courseData.requirements.filter(req => req.trim()),
        targetAudience: courseData.targetAudience,
        chapters: chapters.map((chapter, chapterIndex) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapterIndex + 1,
          lessons: chapter.lessons.map((lesson, lessonIndex) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            order: lessonIndex + 1,
            duration: lesson.duration ? parseInt(lesson.duration) : undefined,
            videoUrl: lesson.videoFile ? undefined : lesson.videoUrl, // Handle file upload separately
            content: lesson.description,
            isPreview: false
          }))
        }))
      }

      const response = await fetch('/api/courses/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      })

      const result = await response.json()

      if (result.success) {
        setCourseId(result.data.courseId)
        alert("Course saved as draft!")
      } else {
        alert("Failed to save draft: " + result.error)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      alert("Failed to save draft. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishCourse = async () => {
    if (!user?.id) {
      alert("Please log in to publish your course")
      return
    }

    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.category || !courseData.level || !courseData.price) {
      alert("Please fill in all required fields before publishing")
      return
    }

    if (chapters.some(chapter => !chapter.title || chapter.lessons.some(lesson => !lesson.title))) {
      alert("Please ensure all chapters and lessons have titles")
      return
    }

    setIsLoading(true)
    try {
      const publishData = {
        title: courseData.title,
        subtitle: courseData.subtitle,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level.toUpperCase(),
        language: courseData.language,
        price: parseFloat(courseData.price),
        trainerId: user.id,
        learningObjectives: courseData.learningObjectives.filter(obj => obj.trim()),
        requirements: courseData.requirements.filter(req => req.trim()),
        targetAudience: courseData.targetAudience,
        status: "PUBLISHED",
        chapters: chapters.map((chapter, chapterIndex) => ({
          title: chapter.title,
          order: chapterIndex + 1,
          lessons: chapter.lessons.map((lesson, lessonIndex) => ({
            title: lesson.title,
            description: lesson.description,
            order: lessonIndex + 1,
            duration: lesson.duration ? parseInt(lesson.duration) : undefined,
            content: lesson.description,
            isPreview: false
          }))
        }))
      }

      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData),
      })

      const result = await response.json()

      if (result.success) {
        alert("Course published successfully!")
        router.push("/instructor")
      } else {
        alert("Failed to publish course: " + result.error)
        console.error("Publish error details:", result.details)
      }
    } catch (error) {
      console.error("Error publishing course:", error)
      alert("Failed to publish course. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { id: 1, title: "Basic Info", description: "Course title, description, and category" },
    { id: 2, title: "Curriculum", description: "Create chapters and lessons" },
    { id: 3, title: "Pricing", description: "Set your course price" },
    { id: 4, title: "Publish", description: "Review and publish your course" }
  ]

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return courseData.title && courseData.description && courseData.category && courseData.level
      case 2:
        return chapters.every(chapter => 
          chapter.title && chapter.lessons.every(lesson => lesson.title)
        )
      case 3:
        return courseData.price
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/instructor" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">CourseCompass</span>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Create Course</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="ghost" onClick={() => router.push("/instructor")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.id 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : isStepComplete(step.id)
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground text-muted-foreground"
                }`}>
                  {isStepComplete(step.id) && currentStep !== step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    isStepComplete(step.id) ? "bg-green-500" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <Progress value={(currentStep / steps.length) * 100} className="w-full" />
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Course Information</CardTitle>
                  <CardDescription>
                    Tell us about your course. This information will help students find and understand your course.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete Web Development Bootcamp"
                      value={courseData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Course Subtitle</Label>
                    <Input
                      id="subtitle"
                      placeholder="e.g., Learn HTML, CSS, JavaScript, React and more"
                      value={courseData.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in your course..."
                      className="min-h-[120px]"
                      value={courseData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={courseData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Level *</Label>
                      <Select value={courseData.level} onValueChange={(value) => handleInputChange("level", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Course Thumbnail</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a course thumbnail (recommended: 1280x720)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('thumbnail-upload')?.click()}>
                        Choose File
                      </Button>
                      {courseData.thumbnail && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {courseData.thumbnail.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>What will students learn? *</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        List the key learning objectives for your course
                      </p>
                      {courseData.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Input
                            placeholder="e.g., Build responsive websites with HTML and CSS"
                            value={objective}
                            onChange={(e) => handleArrayInputChange("learningObjectives", index, e.target.value)}
                          />
                          {courseData.learningObjectives.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem("learningObjectives", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem("learningObjectives")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Learning Objective
                      </Button>
                    </div>

                    <div>
                      <Label>Requirements</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        What should students know before taking your course?
                      </p>
                      {courseData.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Input
                            placeholder="e.g., Basic computer skills"
                            value={requirement}
                            onChange={(e) => handleArrayInputChange("requirements", index, e.target.value)}
                          />
                          {courseData.requirements.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeArrayItem("requirements", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem("requirements")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    Organize your course content into chapters and lessons.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {chapters.map((chapter, chapterIndex) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Chapter {chapterIndex + 1}</h3>
                          {chapters.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setChapters(chapters.filter((_, i) => i !== chapterIndex))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <Input
                          placeholder="Chapter title"
                          value={chapter.title}
                          onChange={(e) => {
                            const updatedChapters = [...chapters]
                            updatedChapters[chapterIndex].title = e.target.value
                            setChapters(updatedChapters)
                          }}
                        />

                        <div className="space-y-3">
                          <h4 className="font-medium">Lessons</h4>
                          {chapter.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="border rounded p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Lesson {lessonIndex + 1}</span>
                                {chapter.lessons.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedChapters = [...chapters]
                                      updatedChapters[chapterIndex].lessons = 
                                        updatedChapters[chapterIndex].lessons.filter((_, i) => i !== lessonIndex)
                                      setChapters(updatedChapters)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <Input
                                placeholder="Lesson title"
                                value={lesson.title}
                                onChange={(e) => {
                                  const updatedChapters = [...chapters]
                                  updatedChapters[chapterIndex].lessons[lessonIndex].title = e.target.value
                                  setChapters(updatedChapters)
                                }}
                              />
                              
                              <Textarea
                                placeholder="Lesson description"
                                value={lesson.description}
                                onChange={(e) => {
                                  const updatedChapters = [...chapters]
                                  updatedChapters[chapterIndex].lessons[lessonIndex].description = e.target.value
                                  setChapters(updatedChapters)
                                }}
                              />

                              <div className="flex items-center space-x-2">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Video upload will be available after saving</span>
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(chapterIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lesson
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" onClick={addChapter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Pricing</CardTitle>
                  <CardDescription>
                    Set the price for your course. You can always change this later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Course Price (USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="99.99"
                        className="pl-10"
                        value={courseData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Pricing Guidelines</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Consider your course length and depth</li>
                      <li>• Research similar courses in your category</li>
                      <li>• You can run promotions and discounts later</li>
                      <li>• Free courses are great for building an audience</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Publish</CardTitle>
                  <CardDescription>
                    Review your course details before publishing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Course Overview</h3>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <p><strong>Title:</strong> {courseData.title || "Not set"}</p>
                        <p><strong>Category:</strong> {courseData.category || "Not set"}</p>
                        <p><strong>Level:</strong> {courseData.level || "Not set"}</p>
                        <p><strong>Price:</strong> ${courseData.price || "Not set"}</p>
                        <p><strong>Chapters:</strong> {chapters.length}</p>
                        <p><strong>Total Lessons:</strong> {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Publishing Checklist</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${courseData.title ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className="text-sm">Course title added</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${courseData.description ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className="text-sm">Course description added</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${chapters.every(c => c.title) ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className="text-sm">All chapters have titles</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${courseData.price ? 'text-green-600' : 'text-muted-foreground'}`} />
                          <span className="text-sm">Course price set</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={handlePublishCourse} className="flex-1" disabled={isLoading}>
                      {isLoading ? "Publishing..." : "Publish Course"}
                    </Button>
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save as Draft"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Course Creation Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : isStepComplete(step.id)
                          ? "bg-green-50 border border-green-200"
                          : "bg-muted/30"
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {isStepComplete(step.id) && currentStep !== step.id ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            currentStep === step.id ? "border-primary-foreground" : "border-muted-foreground"
                          }`} />
                        )}
                        <div>
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-xs opacity-75">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep === steps.length) {
                handlePublishCourse()
              } else {
                setCurrentStep(Math.min(steps.length, currentStep + 1))
              }
            }}
            disabled={!isStepComplete(currentStep) || isLoading}
          >
            {currentStep === steps.length 
              ? (isLoading ? "Publishing..." : "Publish Course") 
              : "Next"
            }
          </Button>
        </div>
      </div>
    </div>
  )
}