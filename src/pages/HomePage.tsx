import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Youtube, Upload, Sparkles, ArrowRight, Play, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden -mt-24">
      {/* Animated gradient orbs - extended to cover header area */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-24 -right-4 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-44 pb-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Logo with enhanced effects */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="inline-flex items-center justify-center mb-8 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <Youtube className="w-14 h-14 text-white" />
            </div>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.span
              className="inline-block text-gray-900 dark:text-white"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Your
            </motion.span>{" "}
            <motion.span
              className="inline-block bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient-text"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              YouTube
            </motion.span>
            <br />
            <motion.span
              className="inline-block text-gray-900 dark:text-white"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Experience
            </motion.span>{" "}
            <motion.span
              className="inline-block bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent animate-gradient-text"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Reimagined
            </motion.span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your subscription chaos into a beautiful, organized feed. 
            <span className="text-gray-700 dark:text-gray-300 font-medium"> Track your favorite creators</span> with a modern interface that puts you in control.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/feed">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg shadow-2xl shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Experience Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            
            <Link to="/generate-feed">
              <Button 
                size="lg" 
                className="relative overflow-hidden bg-white dark:bg-transparent border-2 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/40 px-8 py-6 text-lg transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center font-semibold">
                  <Upload className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Import Your Channels
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Stats or social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live Demo Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <span>Lightning Fast</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <FeatureCard
            icon={<Youtube className="w-8 h-8" />}
            title="Smart Integration"
            description="Seamlessly connects with YouTube to fetch your subscriptions and their latest content"
            gradient="from-red-500 to-pink-500"
            delay={1.3}
          />
          <FeatureCard
            icon={<Upload className="w-8 h-8" />}
            title="Flexible Import"
            description="Upload your subscription list via JSON or paste directly from YouTube takeout"
            gradient="from-green-500 to-emerald-500"
            delay={1.4}
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Beautiful Interface"
            description="Modern design with smooth animations, dark mode, and a focus on content"
            gradient="from-purple-500 to-blue-500"
            delay={1.5}
          />
        </motion.div>

        {/* Additional visual element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-600" />
            <span>Built with modern web technologies</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-600" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  gradient: string;
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200/10 dark:from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 shadow-lg">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
} 