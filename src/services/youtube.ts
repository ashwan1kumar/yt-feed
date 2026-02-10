import axios from 'axios';

// Backend server URL
const BACKEND_URL = process.env.PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Video {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
  contentDetails?: {
    duration: string;
  };
}

export interface Channel {
  channelId: string;
  name: string;
  url: string;
  handle?: string;
}

export interface ChannelInfo extends Channel {
  description: string;
  subscriberCount: number;
  videoCount: number;
  profileImage: string | null;
  bannerImage: string | null;
  categories: string[];
  tags: string[];
  country: string | null;
  customUrl: string | null;
  createdAt: string | null;
}

class YouTubeService {
  async getLatestVideosFromChannel(channelId: string, maxResults: number = 5): Promise<Video[]> {
    try {
      console.log(`Fetching videos for channel: ${channelId}`);
      
      const response = await axios.get(`${BACKEND_URL}/api/channel/${channelId}/videos`);
      
      console.log(`Found ${response.data.length} videos for channel ${channelId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching videos for channel ${channelId}:`, error.message);
      return [];
    }
  }

  async getChannelInfo(channelId: string): Promise<ChannelInfo | null> {
    try {
      console.log(`Fetching info for channel: ${channelId}`);
      
      const response = await axios.get(`${BACKEND_URL}/api/channel/${channelId}/info`);
      
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching channel info for ${channelId}:`, error.message);
      return null;
    }
  }

  async getMultipleChannelsInfo(channelIds: string[]): Promise<ChannelInfo[]> {
    try {
      console.log(`Fetching info for ${channelIds.length} channels`);
      
      const response = await axios.post(`${BACKEND_URL}/api/channels/info`, {
        channelIds
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching multiple channels info:', error.message);
      return [];
    }
  }

  async getVideoDetails(videoId: string): Promise<Video | null> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/video/${videoId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching video details:', error.message);
      return null;
    }
  }

  async getAllChannelVideos(channels: Channel[]): Promise<Video[]> {
    console.log(`Fetching videos from ${channels.length} channels using scraping backend`);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/channels/videos`, {
        channels
      });
      
      console.log(`Total videos fetched: ${response.data.length}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all channel videos:', error);
      // If backend is not running, return empty array with helpful message
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        console.error('Backend server is not running. Please start it with: node server.js');
        throw new Error('Backend server is not running. Please start the scraping server.');
      }
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();