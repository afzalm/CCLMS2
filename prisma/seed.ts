import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create categories
    const webDevCategory = await prisma.category.upsert({
        where: { name: 'Web Development' },
        update: {},
        create: {
            name: 'Web Development',
            description: 'Learn modern web development technologies',
            icon: '💻'
        }
    })

    const dataCategory = await prisma.category.upsert({
        where: { name: 'Data Science' },
        update: {},
        create: {
            name: 'Data Science',
            description: 'Master data analysis and machine learning',
            icon: '📊'
        }
    })

    const designCategory = await prisma.category.upsert({
        where: { name: 'Design' },
        update: {},
        create: {
            name: 'Design',
            description: 'Create beautiful and functional designs',
            icon: '🎨'
        }
    })

    // Create users
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            name: 'John Student',
            password: 'password', // In real app, this would be hashed
            role: 'STUDENT',
            bio: 'Passionate learner interested in web development'
        }
    })

    const instructor1 = await prisma.user.upsert({
        where: { email: 'instructor@example.com' },
        update: {},
        create: {
            email: 'instructor@example.com',
            name: 'Jane Instructor',
            password: 'password',
            role: 'TRAINER',
            bio: 'Senior developer with 10+ years of experience'
        }
    })

    const instructor2 = await prisma.user.upsert({
        where: { email: 'john.smith@example.com' },
        update: {},
        create: {
            email: 'john.smith@example.com',
            name: 'John Smith',
            password: 'password',
            role: 'TRAINER',
            bio: 'React specialist and full-stack developer'
        }
    })

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: 'password',
            role: 'ADMIN',
            bio: 'System administrator'
        }
    })

    // Create courses
    const reactCourse = await prisma.course.upsert({
        where: { id: 'react-course-1' },
        update: {},
        create: {
            id: 'react-course-1',
            title: 'Complete React Development Course',
            description: 'Master React from basics to advanced concepts including hooks, context, and modern patterns.',
            price: 99.99,
            status: 'PUBLISHED',
            level: 'INTERMEDIATE',
            trainerId: instructor2.id,
            categoryId: webDevCategory.id
        }
    })

    const jsCourse = await prisma.course.upsert({
        where: { id: 'js-fundamentals-1' },
        update: {},
        create: {
            id: 'js-fundamentals-1',
            title: 'JavaScript Fundamentals',
            description: 'Learn JavaScript from scratch with hands-on projects and real-world examples.',
            price: 79.99,
            status: 'PUBLISHED',
            level: 'BEGINNER',
            trainerId: instructor1.id,
            categoryId: webDevCategory.id
        }
    })

    const designCourse = await prisma.course.upsert({
        where: { id: 'ui-ux-design-1' },
        update: {},
        create: {
            id: 'ui-ux-design-1',
            title: 'UI/UX Design Principles',
            description: 'Create beautiful and user-friendly interfaces with modern design principles.',
            price: 89.99,
            status: 'PUBLISHED',
            level: 'BEGINNER',
            trainerId: instructor1.id,
            categoryId: designCategory.id
        }
    })

    // Create chapters and lessons for React course
    const reactChapter1 = await prisma.chapter.upsert({
        where: { id: 'react-ch1' },
        update: {},
        create: {
            id: 'react-ch1',
            title: 'Getting Started with React',
            order: 1,
            courseId: reactCourse.id
        }
    })

    const reactChapter2 = await prisma.chapter.upsert({
        where: { id: 'react-ch2' },
        update: {},
        create: {
            id: 'react-ch2',
            title: 'Advanced React Concepts',
            order: 2,
            courseId: reactCourse.id
        }
    })

    // Create lessons
    const lessons = [
        {
            id: 'react-lesson-1',
            title: 'Introduction to React',
            description: 'Learn what React is and why it\'s popular',
            duration: 1200, // 20 minutes
            order: 1,
            chapterId: reactChapter1.id,
            courseId: reactCourse.id
        },
        {
            id: 'react-lesson-2',
            title: 'Setting up Development Environment',
            description: 'Install Node.js, npm, and create your first React app',
            duration: 1800, // 30 minutes
            order: 2,
            chapterId: reactChapter1.id,
            courseId: reactCourse.id
        },
        {
            id: 'react-lesson-17',
            title: 'Advanced State Management with Redux',
            description: 'Learn Redux for complex state management',
            duration: 2400, // 40 minutes
            order: 17,
            chapterId: reactChapter2.id,
            courseId: reactCourse.id
        }
    ]

    for (const lesson of lessons) {
        await prisma.lesson.upsert({
            where: { id: lesson.id },
            update: {},
            create: lesson
        })
    }

    // Create enrollments for student
    const enrollment1 = await prisma.enrollment.upsert({
        where: {
            studentId_courseId: {
                studentId: student.id,
                courseId: reactCourse.id
            }
        },
        update: {},
        create: {
            studentId: student.id,
            courseId: reactCourse.id,
            progress: 65,
            status: 'ACTIVE'
        }
    })

    const enrollment2 = await prisma.enrollment.upsert({
        where: {
            studentId_courseId: {
                studentId: student.id,
                courseId: jsCourse.id
            }
        },
        update: {},
        create: {
            studentId: student.id,
            courseId: jsCourse.id,
            progress: 90,
            status: 'ACTIVE'
        }
    })

    const enrollment3 = await prisma.enrollment.upsert({
        where: {
            studentId_courseId: {
                studentId: student.id,
                courseId: designCourse.id
            }
        },
        update: {},
        create: {
            studentId: student.id,
            courseId: designCourse.id,
            progress: 30,
            status: 'ACTIVE'
        }
    })

    // Create progress records
    await prisma.progress.upsert({
        where: {
            studentId_lessonId: {
                studentId: student.id,
                lessonId: 'react-lesson-1'
            }
        },
        update: {},
        create: {
            studentId: student.id,
            lessonId: 'react-lesson-1',
            enrollmentId: enrollment1.id,
            completed: true,
            watchTime: 1200
        }
    })

    await prisma.progress.upsert({
        where: {
            studentId_lessonId: {
                studentId: student.id,
                lessonId: 'react-lesson-2'
            }
        },
        update: {},
        create: {
            studentId: student.id,
            lessonId: 'react-lesson-2',
            enrollmentId: enrollment1.id,
            completed: true,
            watchTime: 1800
        }
    })

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })