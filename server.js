import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import pLimit from 'p-limit';
import youtubedl from 'youtube-dl-exec';

const app = express();
const PORT = 3001;

const cache = new NodeCache({ stdTTL: 300 });

const limit = pLimit(10);

const ytdlp = youtubedl.create(process.env.YTDLP_PATH || '/opt/homebrew/bin/yt-dlp');

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process
});

app.use(cors());
// Increase JSON payload limit to 50MB to handle large YouTube takeout files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper function to format duration
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Extract channel info from YouTube takeout JSON (kept for backward compatibility)
app.post('/api/process-takeout', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Extract unique channels
    const channelsMap = new Map();
    
    data.forEach(item => {
      if (item.snippet && item.snippet.channelId && item.snippet.channelTitle) {
        const channelId = item.snippet.channelId;
        const channelName = item.snippet.channelTitle;
        
        if (!channelsMap.has(channelId)) {
          channelsMap.set(channelId, {
            channelId,
            name: channelName,
            url: `https://www.youtube.com/channel/${channelId}`
          });
        }
      }
    });
    
    const channels = Array.from(channelsMap.values());
    
    console.log(`Processed ${channels.length} unique channels from takeout data`);
    
    res.json({
      channels,
      total: channels.length
    });
  } catch (error) {
    console.error('Error processing takeout:', error);
    res.status(500).json({ error: 'Failed to process takeout data' });
  }
});

// Fetch videos for a single channel with caching
async function fetchChannelVideos(channel) {
  const cacheKey = `channel:${channel.channelId}`;
  
  // Check cache first
  const cachedVideos = cache.get(cacheKey);
  if (cachedVideos) {
    console.log(`Cache hit for channel: ${channel.channelId}`);
    return cachedVideos;
  }
  
  try {
    console.log(`Fetching videos for channel: ${channel.channelId}`);
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
    const response = await fetch(rssUrl);
    const xml = await response.text();
    
    const $ = cheerio.load(xml, { xmlMode: true });
    const videos = [];
    
    $('entry').slice(0, 5).each((_, elem) => {
      const $elem = $(elem);
      const videoId = $elem.find('yt\\:videoId').text();
      const title = $elem.find('title').text();
      const channelName = $elem.find('author > name').text();
      const publishedAt = $elem.find('published').text();
      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const description = $elem.find('media\\:description').text();
      const viewMatch = $elem.find('media\\:statistics').attr('views');
      
      videos.push({
        id: videoId,
        snippet: {
          title,
          description: description.substring(0, 200) + '...',
          thumbnails: {
            high: {
              url: thumbnail
            }
          },
          channelTitle: channelName || channel.name,
          channelId: channel.channelId,
          publishedAt
        },
        statistics: {
          viewCount: viewMatch || '0',
          likeCount: '0'
        },
        contentDetails: {
          duration: '0:00' // Duration not available in RSS feed
        }
      });
    });
    
    // Cache the results
    cache.set(cacheKey, videos);
    
    return videos;
  } catch (error) {
    console.error(`Error fetching videos for channel ${channel.channelId}:`, error);
    return [];
  }
}

app.get('/api/channel/:channelId/videos', async (req, res) => {
  try {
    const { channelId } = req.params;
    const videos = await fetchChannelVideos({ channelId });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

app.get('/api/channel/:channelId/info', async (req, res) => {
  try {
    const { channelId } = req.params;
    const cacheKey = `channelInfo:${channelId}`;
    
    const cachedInfo = cache.get(cacheKey);
    if (cachedInfo) {
      console.log(`Cache hit for channel info: ${channelId}`);
      return res.json(cachedInfo);
    }
    
    console.log(`Fetching channel info for: ${channelId}`);
    
    const channelUrl = `https://www.youtube.com/channel/${channelId}`;
    
    try {
      const info = await ytdlp(channelUrl, {
        dumpSingleJson: true,
        playlistEnd: 1, // Only get channel info, not all videos,
        flatPlaylist: true,
        noCheckCertificates: true,
        noWarnings: true,
        quiet: true,
        noCallHome: true,
        addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36']
      });
      
      const channelInfo = {
        channelId: channelId,
        name: info.uploader || info.channel || 'Unknown Channel',
        description: info.description || '',
        subscriberCount: info.channel_follower_count || 0,
        videoCount: info.playlist_count || 0,
        profileImage: info.uploader_url ? `https://yt3.ggpht.com/channel/${channelId}` : null,
        bannerImage: null, // YouTube doesn't provide banner through yt-dlp
        categories: info.categories || [],
        tags: info.tags || [],
        country: info.uploader_location || null,
        customUrl: info.uploader_url || null,
        createdAt: null // Not available through yt-dlp
      };
      
      if (info.thumbnails && info.thumbnails.length > 0) {
        // Get the highest quality thumbnail
        const bestThumbnail = info.thumbnails.reduce((best, current) => {
          const bestSize = (best.width || 0) * (best.height || 0);
          const currentSize = (current.width || 0) * (current.height || 0);
          return currentSize > bestSize ? current : best;
        });
        channelInfo.profileImage = bestThumbnail.url;
      }
      
      // Cache the result for 1 hour
      cache.set(cacheKey, channelInfo, 3600);
      
      res.json(channelInfo);
    } catch (ytdlpError) {
      console.error('yt-dlp error:', ytdlpError);
      
      // Fallback: Return basic info
      const basicInfo = {
        channelId: channelId,
        name: 'Unknown Channel',
        description: '',
        subscriberCount: 0,
        videoCount: 0,
        profileImage: `https://yt3.ggpht.com/channel/${channelId}`,
        bannerImage: null,
        categories: [],
        tags: [],
        country: null,
        customUrl: `https://www.youtube.com/channel/${channelId}`,
        createdAt: null
      };
      
      res.json(basicInfo);
    }
  } catch (error) {
    console.error('Error fetching channel info:', error);
    res.status(500).json({ error: 'Failed to fetch channel info' });
  }
});

app.post('/api/channels/info', async (req, res) => {
  try {
    const { channelIds } = req.body;
    
    if (!channelIds || !Array.isArray(channelIds)) {
      return res.status(400).json({ error: 'Invalid channelIds array' });
    }
    
    console.log(`Fetching info for ${channelIds.length} channels`);
    
    // Process channels with rate limiting
    const channelInfoPromises = channelIds.map(channelId => 
      limit(async () => {
        try {
          const response = await fetch(`http://localhost:${PORT}/api/channel/${channelId}/info`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        } catch (error) {
          console.error(`Error fetching info for channel ${channelId}:`, error);
          return null;
        }
      })
    );
    
    const results = await Promise.all(channelInfoPromises);
    const validResults = results.filter(info => info !== null);
    
    res.json(validResults);
  } catch (error) {
    console.error('Error fetching channels info:', error);
    res.status(500).json({ error: 'Failed to fetch channels info' });
  }
});

app.get('/api/video/:videoId/info', async (req, res) => {
  try {
    const { videoId } = req.params;
    const cacheKey = `videoInfo:${videoId}`;
    
    // Check cache first
    const cachedInfo = cache.get(cacheKey);
    if (cachedInfo) {
      console.log(`Cache hit for video info: ${videoId}`);
      return res.json(cachedInfo);
    }
    
    console.log(`Fetching video info for: ${videoId}`);
    
    // Use youtube-dl-exec to get video info
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdlp(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36']
    });
    
    const videoFormats = info.formats
      .filter(format => format.vcodec !== 'none' && format.height)
      .filter(format => format.height >= 360 && format.height <= 1440)
      .reduce((acc, format) => {
        const key = `${format.height}p`;
        if (!acc[key] || (format.tbr || 0) > (acc[key].tbr || 0)) {
          acc[key] = format;
        }
        return acc;
      }, {});
    
    const formats = Object.values(videoFormats)
      .map(f => ({
        quality: f.format_note || `${f.height}p`,
        height: f.height || 0,
        width: f.width || 0,
        fps: f.fps || 30,
        itag: f.format_id,
        container: f.ext,
        codecs: f.vcodec,
        bitrate: f.tbr || 0,
        hasAudio: f.acodec !== 'none'
      }))
      .sort((a, b) => b.height - a.height);
    
    const videoDetails = {
      id: videoId,
      title: info.title || 'Unknown Title',
      description: info.description || '',
      channelTitle: info.uploader || 'Unknown Channel',
      duration: formatDuration(info.duration),
      formats: formats,
      categories: info.categories || []
    };
    
    cache.set(cacheKey, videoDetails, 3600);
    
    res.json(videoDetails);
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
});

// Stream video directly with best quality
app.get('/api/video/:videoId/stream', async (req, res) => {
  let ytdlProcess = null;
  let processKilled = false;
  
  try {
    const { videoId } = req.params;
    const { quality = '1080' } = req.query;
    
    console.log(`Streaming video ${videoId} with quality: ${quality}p`);
    
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Use youtube-dl to get the best format URL
    let formatSpec;
    
    if (quality === 'highest') {
      // Get best video up to 1440p with audio
      formatSpec = 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best';
    } else {
      // Get specific quality with audio
      const heightNum = parseInt(quality);
      formatSpec = `bestvideo[height<=${heightNum}]+bestaudio/best[height<=${heightNum}]/best`;
    }
    
    console.log(`Using format spec: ${formatSpec}`);
    
    // Always pipe through server to avoid CORS and handle merging
    try {
      ytdlProcess = ytdlp.exec(videoUrl, {
        format: formatSpec,
        output: '-', // Output to stdout
        quiet: true,
        noWarnings: true,
        noCallHome: true,
        preferFreeFormats: true,
        noCheckCertificates: true,
        // Force mp4 for better compatibility
        remuxVideo: 'mp4',
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
      });
    } catch (err) {
      console.error('Failed to start yt-dlp process:', err);
      return res.status(500).json({ error: 'Failed to start video stream' });
    }
    
    // Set proper headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Handle process exit
    ytdlProcess.on('exit', (code, signal) => {
      if (!processKilled) {
        console.log(`yt-dlp process exited with code ${code} and signal ${signal}`);
      }
    });
    
    // Handle process errors
    ytdlProcess.on('error', (error) => {
      // Ignore errors if we intentionally killed the process
      if (processKilled) {
        return;
      }
      console.error('Error in youtube-dl process:', error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    });
    
    // Handle stderr for debugging (but don't let it crash)
    ytdlProcess.stderr.on('data', (data) => {
      const message = data.toString();
      // Only log non-warning messages
      if (!message.includes('WARNING:')) {
        console.log('yt-dlp:', message.trim());
      }
    });
    
    // Pipe the video stream
    ytdlProcess.stdout.pipe(res);
    
    // Handle stdout errors
    ytdlProcess.stdout.on('error', (error) => {
      if (!processKilled) {
        console.error('Stdout error:', error.message);
      }
    });
    
    // Handle pipe errors
    ytdlProcess.stdout.on('pipe', () => {
      console.log('Started streaming video to client');
    });
    
    // Clean up on client disconnect
    const cleanup = () => {
      if (ytdlProcess && !processKilled) {
        processKilled = true;
        console.log('Client disconnected, cleaning up yt-dlp process');
        
        ytdlProcess.stdout.removeAllListeners();
        ytdlProcess.stderr.removeAllListeners();
        ytdlProcess.removeAllListeners();
        
        try {
          if (ytdlProcess.pid) {
            process.kill(ytdlProcess.pid, 'SIGTERM');
            
            setTimeout(() => {
              try {
                if (ytdlProcess.pid) {
                  process.kill(ytdlProcess.pid, 'SIGKILL');
                }
              } catch (err) {
              }
            }, 2000);
          }
        } catch (err) {
          // Process might already be dead
          console.log('Process already terminated');
        }
      }
    };
    
    req.on('close', cleanup);
    req.on('error', cleanup);
    res.on('close', cleanup);
    res.on('finish', cleanup);
    
  } catch (error) {
    console.error('Error streaming video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream video' });
    }
  }
});

app.post('/api/channels/videos/stream', async (req, res) => {
  try {
    const { channels } = req.body;
    console.log(`Fetching videos for ${channels.length} channels with streaming`);
    
    // Set up SSE (Server-Sent Events) for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable buffering for nginx
    });
    
    res.write('data: {"type": "connected"}\n\n');
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < channels.length; i += batchSize) {
      batches.push(channels.slice(i, i + batchSize));
    }
    
    let totalProcessed = 0;
    const allVideos = [];
    
    for (const batch of batches) {
      const batchPromises = batch.map(channel => 
        limit(() => fetchChannelVideos(channel))
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      const batchVideos = batchResults.flat();
      allVideos.push(...batchVideos);
      
      totalProcessed += batch.length;
      
      const data = {
        type: 'batch',
        videos: batchVideos,
        processed: totalProcessed,
        total: channels.length
      };
      
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    
    // Sort all videos by published date
    allVideos.sort((a, b) => 
      new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
    );
    
    // Send final sorted results
    const finalData = {
      type: 'complete',
      videos: allVideos,
      total: allVideos.length
    };
    
    res.write(`data: ${JSON.stringify(finalData)}\n\n`);
    
    // Clean up
    clearInterval(keepAlive);
    res.end();
  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

app.post('/api/channels/videos', async (req, res) => {
  try {
    const { channels } = req.body;
    console.log(`Fetching videos for ${channels.length} channels with batching`);
    
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < channels.length; i += batchSize) {
      batches.push(channels.slice(i, i + batchSize));
    }
    
    const allVideos = [];
    
    const allBatchPromises = batches.map(batch => {
      const batchPromises = batch.map(channel => 
        limit(() => fetchChannelVideos(channel))
      );
      return Promise.all(batchPromises);
    });
    
    const allBatchResults = await Promise.all(allBatchPromises);
    
    allBatchResults.forEach(batchResults => {
      batchResults.forEach(videos => {
        allVideos.push(...videos);
      });
    });
    
    // Sort by published date
    allVideos.sort((a, b) => 
      new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
    );
    
    res.json(allVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const cacheKey = `video:${videoId}`;
    
    const cachedVideo = cache.get(cacheKey);
    if (cachedVideo) {
      console.log(`Cache hit for video: ${videoId}`);
      return res.json(cachedVideo);
    }
    
    const video = {
      id: videoId,
      snippet: {
        title: 'Video',
        description: '',
        channelTitle: '',
        publishedAt: new Date().toISOString()
      },
      statistics: {
        viewCount: '0',
        likeCount: '0'
      }
    };
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video details:', error);
    res.status(500).json({ error: 'Failed to fetch video details' });
  }
});

// Cache statistics endpoint
app.get('/api/cache/stats', (req, res) => {
  const keys = cache.keys();
  const stats = {
    keys: keys.length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
  res.json(stats);
});

// Clear cache endpoint
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared' });
});

app.listen(PORT, () => {
  console.log(`Scraping server running on http://localhost:${PORT}`);
  console.log('Features:');
  console.log('- YouTube takeout JSON processing (client-side recommended)');
  console.log('- Video streaming with youtube-dl-exec (up to 1440p with audio)');
  console.log('- Automatic video+audio merging for high quality');
  console.log('- Video info endpoint with format detection');
  console.log('- Increased payload limit to 50MB');
  console.log('- Concurrent fetching with batching (5 channels at a time)');
  console.log('- Proper SSE streaming support');
  console.log('- In-memory caching with 5-minute TTL');
});