import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelCard } from "@/components/ui/channel-card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, ArrowLeft, PlayCircle, ChevronLeft, ChevronRight, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { VideoCard } from "@/components/feed/VideoCard";
import { VideoSkeleton } from "@/components/feed/VideoSkeleton";
import type { Channel, ChannelInfo, Video } from "@/services/youtube";
import { youtubeService } from "@/services/youtube";

const CHANNELS_PER_PAGE = 12;

export default function AllChannelsPage() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [channelsInfo, setChannelsInfo] = useState<Map<string, ChannelInfo>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingChannelInfo, setLoadingChannelInfo] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Filters removed as per requirements

  useEffect(() => {
    // Load all channels from localStorage
    const storedChannels = localStorage.getItem('allChannels');
    if (storedChannels) {
      try {
        const parsed = JSON.parse(storedChannels);
        if (parsed.channels && Array.isArray(parsed.channels)) {
          setAllChannels(parsed.channels);
        }
      } catch (e) {
        console.error('Error loading channels:', e);
      }
    }
  }, []);

  // Fetch channel info for current page
  useEffect(() => {
    const fetchChannelInfo = async () => {
      if (allChannels.length === 0) return;

      setLoadingChannelInfo(true);
      
      // Get channels for current page
      const startIndex = (currentPage - 1) * CHANNELS_PER_PAGE;
      const endIndex = startIndex + CHANNELS_PER_PAGE;
      const pageChannels = filteredChannels.slice(startIndex, endIndex);
      
      // Only fetch info for channels we haven't fetched yet
      const channelsToFetch = pageChannels.filter(channel => !channelsInfo.has(channel.channelId));
      
      if (channelsToFetch.length > 0) {
        const channelIds = channelsToFetch.map(c => c.channelId);
        const infos = await youtubeService.getMultipleChannelsInfo(channelIds);
        
        // Update the channelsInfo map
        const newMap = new Map(channelsInfo);
        infos.forEach(info => {
          newMap.set(info.channelId, info);
        });
        setChannelsInfo(newMap);
      }
      
      setLoadingChannelInfo(false);
    };

    fetchChannelInfo();
  }, [currentPage, allChannels, searchQuery]);

  // Filter channels based on search only
  const filteredChannels = useMemo(() => {
    return allChannels.filter(channel => {
      // Search filter
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [allChannels, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredChannels.length / CHANNELS_PER_PAGE);
  const startIndex = (currentPage - 1) * CHANNELS_PER_PAGE;
  const endIndex = startIndex + CHANNELS_PER_PAGE;
  const currentChannels = filteredChannels.slice(startIndex, endIndex);

  const loadChannelVideos = async (channel: Channel) => {
    setSelectedChannel(channel);
    setLoadingVideos(true);
    setVideoError("");
    setChannelVideos([]);

    try {
      const videos = await youtubeService.getLatestVideosFromChannel(channel.channelId);
      setChannelVideos(videos);
    } catch (error) {
      console.error('Error loading channel videos:', error);
      setVideoError("Failed to load videos from this channel");
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleBack = () => {
    setSelectedChannel(null);
    setChannelVideos([]);
    setVideoError("");
  };



  if (allChannels.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Card className="max-w-md shadow-2xl border border-gray-200 dark:border-border/50 bg-white dark:bg-card">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-semibold mb-2">No channels found</p>
            <p className="text-muted-foreground mb-4">
              Please upload your YouTube subscriptions first
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If a channel is selected, show its videos
  if (selectedChannel) {
    return (
      <div className="relative min-h-screen -mt-24">
        {/* Background effects - extended to cover header area */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-64 -right-40 w-80 h-80 bg-gradient-to-br from-red-600/10 to-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto pt-32 pb-8 px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 hover:bg-gray-100 dark:hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Channels
            </Button>
            
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-primary dark:via-purple-600 dark:to-pink-600 bg-clip-text text-transparent">
              {selectedChannel.name}
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground">
              Latest videos from this channel
            </p>
          </motion.div>

          {videoError && (
            <Card className="border-red-200 dark:border-destructive/50 bg-red-50 dark:bg-destructive/5 mb-6 shadow-lg">
              <CardContent className="flex items-center gap-2 pt-6">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{videoError}</p>
              </CardContent>
            </Card>
          )}

          {loadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <VideoSkeleton key={i} />
              ))}
            </div>
          ) : channelVideos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {channelVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </motion.div>
          ) : !videoError && (
            <Card className="shadow-xl border border-gray-200 dark:border-border/50 bg-white dark:bg-card">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold mb-2">No videos found</p>
                <p className="text-muted-foreground">
                  This channel hasn't posted any videos recently
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show all channels with pagination
  return (
    <div className="relative min-h-screen -mt-24">
      {/* Background effects - extended to cover header area */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -right-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto pt-32 pb-8 px-4 max-w-7xl relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-primary dark:via-purple-600 dark:to-pink-600 bg-clip-text text-transparent">
              All Subscribed Channels
            </h1>
          </div>
          <p className="text-gray-600 dark:text-muted-foreground ml-11">
            Browse all {allChannels.length} channels you're subscribed to
          </p>
        </motion.div>

        {/* Search Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-muted-foreground w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="relative w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-background transition-all text-gray-900 dark:text-foreground"
            />
          </div>
        </motion.div>

        {/* Results summary */}
        <div className="mb-4 text-sm text-gray-600 dark:text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-600" />
          Showing {startIndex + 1}-{Math.min(endIndex, filteredChannels.length)} of {filteredChannels.length} channels
          {searchQuery && " (filtered)"}
        </div>

        {/* Channels Grid */}
        {loadingChannelInfo && currentChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentChannels.map((channel) => {
              const info = channelsInfo.get(channel.channelId);
              if (info) {
                return (
                  <motion.div
                    key={channel.channelId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChannelCard 
                      channel={info}
                      onClick={() => loadChannelVideos(channel)}
                    />
                  </motion.div>
                );
              } else {
                // Show loading skeleton for channels without info yet
                return (
                  <Card key={channel.channelId} className="animate-pulse shadow-lg border border-gray-200 dark:border-border/50 bg-white dark:bg-card">
                    <div className="h-24 bg-gray-200 dark:bg-muted" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-muted" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 dark:bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 dark:bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        ) : currentChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentChannels.map((channel, index) => {
              const info = channelsInfo.get(channel.channelId);
              const channelData: ChannelInfo = info || {
                ...channel,
                description: '',
                subscriberCount: 0,
                videoCount: 0,
                profileImage: null,
                bannerImage: null,
                categories: [],
                tags: [],
                country: null,
                customUrl: channel.url,
                createdAt: null
              };
              
              return (
                <motion.div
                  key={channel.channelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ChannelCard 
                    channel={channelData}
                    onClick={() => loadChannelVideos(channel)}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-xl border border-gray-200 dark:border-border/50 bg-white dark:bg-card">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold mb-2">No channels found</p>
              <p className="text-gray-600 dark:text-muted-foreground">
                Try adjusting your search
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-1 hover:bg-gray-100 dark:hover:bg-primary/10 hover:border-gray-400 dark:hover:border-primary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 2;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] transition-all ${
                        page === currentPage 
                          ? 'bg-gradient-to-r from-primary to-purple-600 border-0 shadow-lg text-white' 
                          : 'hover:bg-gray-100 dark:hover:bg-primary/10 hover:border-gray-400 dark:hover:border-primary'
                      }`}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="gap-1 hover:bg-gray-100 dark:hover:bg-primary/10 hover:border-gray-400 dark:hover:border-primary disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 