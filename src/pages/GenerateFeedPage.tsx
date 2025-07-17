import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileJson, Check, AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import type { Channel } from "@/services/youtube";

export default function GenerateFeedPage() {
  const navigate = useNavigate();
  const [jsonContent, setJsonContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to extract channels from YouTube's complex structure
  const extractChannelsFromYouTubeFeed = (data: any): Channel[] => {
    const channelsMap = new Map<string, Channel>();
    
    // Navigate through YouTube's nested structure
    try {
      // Common paths where channels might be found in YouTube's JSON
      const paths = [
        // Main subscriptions path
        data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents,
        // Alternative path
        data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents,
        // Direct items array
        data?.items,
        // If data is already an array of sections
        Array.isArray(data) ? data : null
      ];

      for (const path of paths) {
        if (!path) continue;
        
        // Iterate through sections
        if (Array.isArray(path)) {
          path.forEach(section => {
            // Check for itemSectionRenderer
            const items = section?.itemSectionRenderer?.contents || [];
            
            items.forEach((item: any) => {
              // Check for shelfRenderer with expandedShelfContentsRenderer
              const shelfItems = item?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items || 
                               item?.shelfRenderer?.content?.horizontalListRenderer?.items || 
                               [];
              
              shelfItems.forEach((shelfItem: any) => {
                const channelData = shelfItem?.channelRenderer;
                if (channelData && channelData.channelId) {
                  const channelId = channelData.channelId;
                  const title = channelData.title?.simpleText || 
                               channelData.title?.runs?.[0]?.text || 
                               'Unknown Channel';
                  const handle = channelData.subscriberCountText?.simpleText || 
                               channelData.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || '';
                  
                  if (!channelsMap.has(channelId)) {
                    channelsMap.set(channelId, {
                      channelId,
                      name: title,
                      url: handle.startsWith('@') 
                        ? `https://www.youtube.com/${handle}`
                        : `https://www.youtube.com/channel/${channelId}`,
                      handle: handle
                    });
                  }
                }
              });
              
              // Also check direct channelRenderer
              const directChannel = item?.channelRenderer;
              if (directChannel && directChannel.channelId) {
                const channelId = directChannel.channelId;
                const title = directChannel.title?.simpleText || 
                             directChannel.title?.runs?.[0]?.text || 
                             'Unknown Channel';
                const handle = directChannel.subscriberCountText?.simpleText || 
                             directChannel.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || '';
                
                if (!channelsMap.has(channelId)) {
                  channelsMap.set(channelId, {
                    channelId,
                    name: title,
                    url: handle.startsWith('@') 
                      ? `https://www.youtube.com/${handle}`
                      : `https://www.youtube.com/channel/${channelId}`,
                    handle: handle
                  });
                }
              }
            });
          });
        }
      }
    } catch (e) {
      console.error('Error navigating YouTube JSON structure:', e);
    }
    
    return Array.from(channelsMap.values());
  };

  const processYouTubeTakeout = async (content: string) => {
    try {
      setIsProcessing(true);
      setError("");
      
      // Parse the JSON to validate it
      const parsed = JSON.parse(content);
      
      // Check if it's already in channels.json format
      if (parsed.channels && Array.isArray(parsed.channels)) {
        // Direct channels format
        const validChannels = parsed.channels.filter((ch: any) => 
          ch.channelId && ch.name
        );
        
        if (validChannels.length === 0) {
          throw new Error("No valid channels found in the JSON");
        }
        
        setChannels(validChannels);
        return true;
      }
      
      // Check if it's YouTube takeout history format (array)
      if (Array.isArray(parsed)) {
        // Extract unique channels from takeout data
        const channelsMap = new Map<string, Channel>();
        
        parsed.forEach((item: any) => {
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
        
        const extractedChannels = Array.from(channelsMap.values());
        
        if (extractedChannels.length === 0) {
          throw new Error("No channels found in the takeout data");
        }
        
        console.log(`Extracted ${extractedChannels.length} unique channels from takeout data`);
        setChannels(extractedChannels);
        return true;
      }
      
      // Try to extract from YouTube's complex JSON structure (yt-feed.json format)
      const extractedChannels = extractChannelsFromYouTubeFeed(parsed);
      
      if (extractedChannels.length > 0) {
        console.log(`Extracted ${extractedChannels.length} channels from YouTube feed data`);
        setChannels(extractedChannels);
        return true;
      } else {
        throw new Error("No channels found. Please ensure you're uploading a valid YouTube subscriptions export or takeout file.");
      }
    } catch (e: any) {
      if (e.message) {
        setError(e.message);
      } else {
        setError("Failed to process YouTube data. Please check the file format.");
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (warn if > 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log(`Processing large file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setJsonContent(content.substring(0, 1000) + '...'); // Only show preview
        await processYouTubeTakeout(content);
      };
      reader.onerror = () => {
        setError("Failed to read file");
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const handlePaste = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setJsonContent(content);
    if (content) {
      await processYouTubeTakeout(content);
    }
  };

  const handleSave = () => {
    if (channels.length > 0) {
      // Save all channels to localStorage
      localStorage.setItem('allChannels', JSON.stringify({ channels }));
      setSuccess(true);
      
      // Redirect to select favorites
      setTimeout(() => {
        navigate('/select-favorites');
      }, 1500);
    }
  };

  const sampleJSON = `Supported formats:

1. YouTube Feed Export (yt-feed.json):
{
  "contents": {
    "twoColumnBrowseResultsRenderer": {
      "tabs": [{
        "tabRenderer": {
          "content": {
            "sectionListRenderer": {
              "contents": [...]
            }
          }
        }
      }]
    }
  }
}

2. YouTube Takeout History:
[
  {
    "snippet": {
      "channelId": "UCBJycsmduvYEL83R_U4JriQ",
      "channelTitle": "Marques Brownlee"
    }
  }
]

3. Simple channels.json:
{
  "channels": [
    {
      "channelId": "UCBJycsmduvYEL83R_U4JriQ",
      "name": "Marques Brownlee"
    }
  ]
}`;

  return (
    <div className="relative min-h-screen -mt-24">
      {/* Background effects - extended to cover header area */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -right-40 w-80 h-80 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto pt-32 pb-8 px-4 max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-emerald-500/25">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Import Your YouTube Subscriptions
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">
            Upload your YouTube subscriptions export (yt-feed.json), takeout, or channels.json file
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <FileJson className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  Upload JSON File
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Drag and drop your yt-feed.json, takeout, or channels.json file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <input {...getInputProps()} />
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative p-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <Upload className="w-8 h-8 text-green-500 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {isDragActive
                      ? "Drop the file here..."
                      : "Drag & drop your JSON file here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports yt-feed.json and large YouTube files
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <FileJson className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  Paste JSON Content
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Or paste your YouTube data directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={jsonContent}
                  onChange={handlePaste}
                  placeholder="Paste your JSON here..."
                  className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border">
              <CardContent className="flex items-center gap-2 pt-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm text-gray-700 dark:text-gray-200">Processing your YouTube data locally...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="border-red-200 dark:border-destructive/50 bg-red-50 dark:bg-destructive/10">
              <CardContent className="flex items-center gap-2 pt-6">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {channels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Found {channels.length} Channels</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Ready to select your favorite channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {channels.slice(0, 10).map((channel) => (
                    <span
                      key={channel.channelId}
                      className="px-3 py-1 bg-purple-100 dark:bg-primary/10 text-purple-700 dark:text-primary rounded-full text-sm"
                    >
                      {channel.name}
                    </span>
                  ))}
                  {channels.length > 10 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground rounded-full text-sm">
                      +{channels.length - 10} more
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full"
                  disabled={success}
                >
                  {success ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved! Redirecting to select favorites...
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4 mr-2" />
                      Continue to Select Favorites
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Supported Formats</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Multiple YouTube export formats are supported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                  <code className="text-gray-800 dark:text-gray-200">{sampleJSON}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 