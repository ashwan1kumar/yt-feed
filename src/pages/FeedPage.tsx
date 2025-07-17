import { VideoGrid } from "@/components/feed/VideoGrid";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function FeedPage() {
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-pink-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Your YouTube Feed
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">
            Latest videos from your subscribed channels
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VideoGrid />
        </motion.div>
      </div>
    </div>
  );
} 