import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/utils/format";
import { PlayCircle, Eye, ThumbsUp, Clock, Sparkles } from "lucide-react";
import type { Video } from "@/services/youtube";
import { Link } from "react-router-dom";

interface VideoCardProps {
  video: Video;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Generate consistent color based on channel name
  const getChannelColor = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-green-500',
      'from-amber-500 to-orange-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const gradientColor = getChannelColor(video.snippet.channelTitle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, type: "spring", bounce: 0.3 }}
      className="relative group h-full"
    >
      {/* Layered shadow effect for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-70 dark:group-hover:opacity-70 transition-opacity duration-500 -z-10 transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-xl blur-2xl opacity-0 group-hover:opacity-50 dark:group-hover:opacity-50 transition-opacity duration-500 -z-20 transform translate-y-2 group-hover:translate-y-4 group-hover:scale-110" />
      
      <Link to={`/video/${video.id}`} className="block h-full">
        <Card className="relative cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:border-gray-300 dark:hover:border-white/20 h-full flex flex-col">
          {/* Fixed aspect ratio container for thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-black/50 flex-shrink-0">
            {!imageError ? (
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradientColor}`}>
                <PlayCircle className="w-16 h-16 text-white/80" />
              </div>
            )}
            
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent dark:from-black/80 dark:via-black/20 opacity-40 dark:opacity-60 group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity duration-300" />
            
            {/* Play button with glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white blur-xl opacity-50" />
                <div className="relative p-4 rounded-full bg-white shadow-2xl">
                  <PlayCircle className="w-8 h-8 text-black" />
                </div>
              </motion.div>
            </div>
            
            {/* Duration badge with glass effect */}
            {video.contentDetails?.duration && video.contentDetails.duration !== '0:00' && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-gray-900/80 dark:bg-black/60 backdrop-blur-md rounded-md text-xs text-white flex items-center gap-1 border border-gray-300/50 dark:border-white/10">
                <Clock className="w-3 h-3" />
                {video.contentDetails.duration}
              </div>
            )}
            
            {/* New/Popular indicator */}
            {video.statistics?.viewCount && parseInt(video.statistics.viewCount) > 100000 && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 backdrop-blur-md rounded-md text-xs text-white flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                <span className="font-semibold">Popular</span>
              </div>
            )}
          </div>
          
          {/* Fixed height content area */}
          <CardContent className="p-4 relative flex-1 flex flex-col">
            {/* Title with fixed height */}
            <h3 className="font-semibold line-clamp-2 mb-3 text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-white transition-colors duration-300 h-12" title={video.snippet.title}>
              {video.snippet.title}
            </h3>
            
            {/* Channel info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className={`relative w-7 h-7 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                {video.snippet.channelTitle.charAt(0).toUpperCase()}
              </div>
              <span className="truncate hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{video.snippet.channelTitle}</span>
            </div>
            
            {/* Stats section pushed to bottom */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-auto">
              {video.statistics?.viewCount && (
                <div className="flex items-center gap-1.5 group/stat">
                  <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover/stat:from-purple-500 group-hover/stat:to-pink-500 transition-all duration-300">
                    <Eye className="w-3 h-3 text-purple-600 dark:text-purple-400 group-hover/stat:text-white transition-colors" />
                  </div>
                  <span className="group-hover/stat:text-gray-700 dark:group-hover/stat:text-gray-300 transition-colors">{parseInt(video.statistics.viewCount).toLocaleString()} views</span>
                </div>
              )}
              {video.statistics?.likeCount && parseInt(video.statistics.likeCount) > 0 && (
                <div className="flex items-center gap-1.5 group/stat">
                  <div className="p-1 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover/stat:from-green-500 group-hover/stat:to-emerald-500 transition-all duration-300">
                    <ThumbsUp className="w-3 h-3 text-green-600 dark:text-green-400 group-hover/stat:text-white transition-colors" />
                  </div>
                  <span className="group-hover/stat:text-gray-700 dark:group-hover/stat:text-gray-300 transition-colors">{parseInt(video.statistics.likeCount).toLocaleString()}</span>
                </div>
              )}
              <span className="ml-auto text-gray-400 dark:text-gray-600">
                {formatDistanceToNow(video.snippet.publishedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 