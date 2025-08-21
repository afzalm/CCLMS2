import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401
    })
  }

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  const platform = searchParams.get('platform'); // 'bunny', 'vimeo', 'youtube'

  if (!videoId || !platform) {
    return new NextResponse(JSON.stringify({ error: 'videoId and platform are required' }), {
      status: 400
    })
  }

  // Retrieve video details from the database
  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  if (!video) {
    return new NextResponse(JSON.stringify({ error: 'video not found' }), {
      status: 404
    })
  }

  // Generate signed URL for Bunny.net
  if (platform === 'bunny') {
    // TODO: Implement Bunny.net signed URL generation
    // This is a placeholder. You'll need to use the Bunny.net API to generate a signed URL.
    // const signedUrl = await generateBunnySignedUrl(video.url);
    // For now, we'll just return the original URL
    return NextResponse.json({ url: video.url });
  }

  // For Vimeo and YouTube, we can usually use the URL directly
  // or generate an embed URL.
  if (platform === 'vimeo' || platform === 'youtube') {
    return NextResponse.json({ url: video.url });
  }

  return new NextResponse(JSON.stringify({ error: 'invalid platform' }), {
    status: 400
  });
}

// Placeholder function for Bunny.net signed URL generation
// async function generateBunnySignedUrl(url: string) {
//   // Implement Bunny.net signed URL generation logic here
//   // You'll need to use the Bunny.net API and your API key
//   return url;
// }