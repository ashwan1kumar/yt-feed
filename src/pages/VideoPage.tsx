import { useParams } from "react-router-dom";
import { NativeVideoPlayer } from "@/components/player/NativeVideoPlayer";
import { VideoDetails } from "@/components/player/VideoDetails";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  duration: string;
  formats: Array<{
    quality: string;
    height: number;
    width: number;
    fps: number;
    itag: number;
    container: string;
    codecs: string;
    bitrate: number;
  }>;
}

export default function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();

  // Fetch video info including available formats
  const { data: videoInfo, isLoading } = useQuery<VideoInfo>({
    queryKey: ['videoInfo', videoId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3001/api/video/${videoId}/info`);
      return response.data;
    },
    enabled: !!videoId,
  });

  if (!videoId) {
    return <div>Video not found</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-muted rounded-lg mb-4" />
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NativeVideoPlayer 
            videoId={videoId} 
            title={videoInfo?.title}
            formats={videoInfo?.formats}
            duration={videoInfo?.duration}
          />
          <VideoDetails videoId={videoId} />
        </div>
        <div className="lg:col-span-1">
          {/* Related videos will go here */}
        </div>
      </div>
    </div>
  );
} 