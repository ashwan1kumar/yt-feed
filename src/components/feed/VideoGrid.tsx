import { useVideos } from "@/hooks/useVideos";
import { VideoCard } from "./VideoCard";
import { VideoSkeleton } from "./VideoSkeleton";
import { AlertCircle, Server, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function VideoGrid() {
  const navigate = useNavigate();
  const { data: videos, isLoading, error } = useVideos(true); // Only fetch favorite channels

  // Check if user has selected favorite channels
  const hasFavorites = () => {
    const favorites = localStorage.getItem('favoriteChannels');
    if (favorites) {
      try {
        const parsed = JSON.parse(favorites);
        return parsed.channels && parsed.channels.length > 0;
      } catch {
        return false;
      }
    }
    return false;
  };

  if (error) {
    const isBackendError = error.message?.includes('Backend server');
    
    return (
      <Card className="max-w-2xl mx-auto bg-white dark:bg-card border border-gray-200 dark:border-border">
        <CardContent className="text-center py-12">
          {isBackendError ? (
            <>
              <Server className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Scraping Server Not Running</p>
              <p className="text-muted-foreground mb-4">
                The backend server needs to be running to fetch videos.
              </p>
              <div className="text-sm text-left max-w-md mx-auto space-y-2">
                <p className="font-semibold">To start the server:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open a new terminal</li>
                  <li>Run: <code className="bg-gray-100 dark:bg-muted px-1 py-0.5 rounded text-gray-800 dark:text-foreground">node server.js</code></li>
                  <li>Keep it running while using the app</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Error loading videos</p>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Check if user has no favorite channels selected
  if (!hasFavorites()) {
    return (
      <Card className="max-w-2xl mx-auto bg-white dark:bg-card border border-gray-200 dark:border-border">
        <CardContent className="text-center py-12">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No Favorite Channels Selected</p>
          <p className="text-muted-foreground mb-4">
            Select up to 10 favorite channels to see their videos in your main feed
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/select-favorites')}
            >
              Select Favorite Channels
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/all-channels')}
            >
              Browse All Channels
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto bg-white dark:bg-card border border-gray-200 dark:border-border">
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No videos found</p>
          <p className="text-muted-foreground mb-4">
            This could mean:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground text-left max-w-md mx-auto">
            <li>Your favorite channels haven't posted recently</li>
            <li>The channel IDs might be incorrect</li>
            <li>There was an issue fetching the data</li>
          </ul>
          <div className="flex gap-4 justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/select-favorites')}
            >
              Change Favorite Channels
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/all-channels')}
            >
              Browse All Channels
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} index={index} />
      ))}
    </div>
  );
} 