import { useQuery } from '@tanstack/react-query';
import { youtubeService } from '@/services/youtube';
import { useChannels } from './useChannels';

export function useVideos(favoriteOnly: boolean = true) {
  const { data: channels, isLoading: channelsLoading } = useChannels(favoriteOnly);

  return useQuery({
    queryKey: ['videos', channels, favoriteOnly],
    queryFn: async () => {
      if (!channels || channels.length === 0) return [];
      return youtubeService.getAllChannelVideos(channels);
    },
    enabled: !channelsLoading && !!channels && channels.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: () => youtubeService.getVideoDetails(videoId),
    enabled: !!videoId,
  });
} 