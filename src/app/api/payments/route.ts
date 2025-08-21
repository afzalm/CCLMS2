import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Stripe from 'stripe'
import Razorpay from 'razorpay'

// Initialize Stripe and Razorpay
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const { courseId, paymentMethod } = await req.json()

  // Get the course details
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    return new NextResponse(JSON.stringify({ error: 'course not found' }), {
      status: 404
    })
  }

  // Create a payment intent with Stripe
  if (paymentMethod === 'stripe') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.price * 100, // Stripe expects amount in cents
        currency: 'usd', // TODO: Make this configurable
        metadata: {
          courseId: course.id,
          studentId: session.user.id,
        },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      return new NextResponse(JSON.stringify({ error: 'payment failed' }), {
        status: 500
      });
    }
  }

  // Create an order with Razorpay
  if (paymentMethod === 'razorpay') {
    try {
      const options = {
        amount: course.price * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `course_${course.id}_student_${session.user.id}`,
        payment_capture: 1, // Auto-capture payment
      };

      const order = await razorpay.orders.create(options);

      return NextResponse.json({ orderId: order.id, amount: order.amount });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return new NextResponse(JSON.stringify({ error: 'payment failed' }), {
        status: 500
      });
    }
  }

  return new NextResponse(JSON.stringify({ error: 'invalid payment method' }), {
    status: 400
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const { searchParams } = new URL(req.url);
  const paymentIntentId = searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return new NextResponse(JSON.stringify({ error: 'payment_intent is required' }), {
      status: 400
    })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If the payment was successful, enroll the student in the course
    if (paymentIntent.status === 'succeeded') {
      const courseId = paymentIntent.metadata.courseId;

      // Check if the user is already enrolled in the course
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId,
          },
        },
      });

      if (!existingEnrollment) {
        // Create the enrollment
        await prisma.enrollment.create({
          data: {
            student: {
              connect: {
                id: session.user.id
              }
            },
            course: {
              connect: {
                id: courseId
              }
            }
          }
        });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, status: paymentIntent.status });
    }
  } catch (error) {
    console.error('Error retrieving Stripe payment intent:', error);
    return new NextResponse(JSON.stringify({ error: 'payment verification failed' }), {
      status: 500
    });
  }
}