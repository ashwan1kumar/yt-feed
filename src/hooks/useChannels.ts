import { useQuery } from '@tanstack/react-query';
import type { Channel } from '@/services/youtube';

export function useChannels(favoriteOnly: boolean = false) {
  return useQuery<Channel[]>({
    queryKey: ['channels', favoriteOnly],
    queryFn: async () => {
      if (favoriteOnly) {
        // Get favorite channels for the main feed
        const favoriteChannels = localStorage.getItem('favoriteChannels');
        if (favoriteChannels) {
          try {
            const parsed = JSON.parse(favoriteChannels);
            if (parsed.channels && Array.isArray(parsed.channels)) {
              return parsed.channels;
            }
          } catch (e) {
            console.error('Error parsing favorite channels:', e);
          }
        }
        return [];
      }
      
      // Get all channels
      const allChannels = localStorage.getItem('allChannels');
      if (allChannels) {
        try {
          const parsed = JSON.parse(allChannels);
          if (parsed.channels && Array.isArray(parsed.channels)) {
            return parsed.channels;
          }
        } catch (e) {
          console.error('Error parsing all channels:', e);
        }
      }
      
      // Fall back to default channels.json if no user data
      const response = await fetch('/channels.json');
      const data = await response.json();
      return data.channels;
    },
    staleTime: Infinity, // Channels don't change often
  });
} 