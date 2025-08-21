'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Player as VimeoPlayer } from '@vimeo/player'
import YouTubePlayer from 'youtube-player'

declare global {
  interface Window {
    Vimeo: typeof import('@vimeo/player').default;
    YT: typeof import('youtube-player/dist/types');
  }
}

export default function Watch() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videoId, setVideoId] = useState('')
  const [platform, setPlatform] = useState('youtube') // 'youtube', 'vimeo', 'bunny'
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer | typeof YouTubePlayer | HTMLVideoElement | null>(null);

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/login')
    return null
  }

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId) return;
      const res = await fetch(`/api/videos?videoId=${videoId}&platform=${platform}`);
      const data = await res.json();

      if (res.ok) {
        if (platform === 'youtube' && videoContainerRef.current) {
          playerRef.current = YouTubePlayer(videoContainerRef.current, {
            videoId: data.url.split('v=')[1], // Extract video ID from YouTube URL
          });
        } else if (platform === 'vimeo' && videoContainerRef.current) {
          playerRef.current = new VimeoPlayer(videoContainerRef.current, {
            url: data.url,
          });
        } else if (platform === 'bunny' && videoContainerRef.current) {
          // For Bunny.net, we can use a simple video element or an iframe
          // This is a basic example, you might want to use a more robust player
          videoContainerRef.current.innerHTML = `<video src="${data.url}" controls width="100%" height="100%"></video>`;
        }
      } else {
        console.error('Failed to load video:', data.error);
      }
    };

    loadVideo();

    return () => {
      // Cleanup player on unmount
      if (playerRef.current) {
        if (platform === 'youtube') {
          playerRef.current.destroy();
        } else if (platform === 'vimeo') {
          playerRef.current.unload();
        }
      }
    };
  }, [videoId, platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The video will be loaded in the useEffect hook
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Watch Video</h1>
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="mb-4">
          <label htmlFor="videoId" className="block text-sm font-medium mb-1">
            Video ID
          </label>
          <input
            type="text"
            id="videoId"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="platform" className="block text-sm font-medium mb-1">
            Platform
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="bunny">Bunny.net</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Load Video
        </button>
      </form>
      <div ref={videoContainerRef} className="w-full h-96"></div>
    </div>
  )
}