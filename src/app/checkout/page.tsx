'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Checkout() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courseId, setCourseId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        paymentMethod,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (paymentMethod === 'stripe' && data.clientSecret) {
        // Redirect to Stripe checkout
        const stripe = await stripePromise;
        const { error } = await stripe!.redirectToCheckout({
          clientSecret: data.clientSecret
        } as any);

        if (error) {
          console.error('Stripe checkout error:', error);
        }
      } else if (paymentMethod === 'razorpay' && data.orderId) {
        // Redirect to Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "CourseCompass",
          description: "Course Payment",
          order_id: data.orderId,
          handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) {
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature);
            // TODO: Verify payment with backend
          },
          prefill: {
            name: session.user.name,
            email: session.user.email,
          },
          theme: {
            color: "#3399cc"
          }
        };
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      }
    } else {
      console.error('Failed to create payment')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="courseId" className="block text-sm font-medium mb-1">
            Course ID
          </label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Pay Now
        </button>
      </form>
    </div>
  )
}