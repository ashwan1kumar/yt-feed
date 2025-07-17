import { useVideo } from "@/hooks/useVideos";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/utils/format";
import { ThumbsUp, Eye } from "lucide-react";

interface VideoDetailsProps {
  videoId: string;
}

export function VideoDetails({ videoId }: VideoDetailsProps) {
  const { data: video, isLoading } = useVideo(videoId);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="h-8 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-2" />
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-4">{video.snippet.title}</h1>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
          {video.statistics && (
            <>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{parseInt(video.statistics.viewCount).toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>{parseInt(video.statistics.likeCount).toLocaleString()} likes</span>
              </div>
            </>
          )}
          <span>{formatDistanceToNow(video.snippet.publishedAt)}</span>
        </div>

        <div className="border-t pt-4">
          <p className="font-semibold mb-2">{video.snippet.channelTitle}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {video.snippet.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 