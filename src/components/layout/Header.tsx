import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Youtube, Upload, Home, Star, Users, Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Header() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark mode was previously set
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <header className="mx-auto max-w-7xl rounded-2xl border border-gray-200/50 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-2xl backdrop-saturate-150 shadow-xl shadow-gray-200/20 dark:shadow-black/20 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-300/30 dark:hover:shadow-black/40">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-500/5 dark:via-transparent dark:to-blue-500/5 rounded-2xl" />
        <div className="relative flex h-16 items-center px-6">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-lg">
                  <Youtube className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">YT Feed</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 transition-all duration-200 hover:text-gray-900 dark:hover:text-white group",
                  isActive("/") ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  isActive("/") 
                    ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25" 
                    : "bg-gradient-to-br from-blue-500/20 to-cyan-600/20 group-hover:from-blue-500/30 group-hover:to-cyan-600/30"
                )}>
                  <Home className="h-3.5 w-3.5 text-white" />
                </div>
                <span>Home</span>
              </Link>
              <Link
                to="/feed"
                className={cn(
                  "flex items-center gap-2 transition-all duration-200 hover:text-gray-900 dark:hover:text-white group",
                  isActive("/feed") ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  isActive("/feed") 
                    ? "bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/25" 
                    : "bg-gradient-to-br from-yellow-500/20 to-orange-600/20 group-hover:from-yellow-500/30 group-hover:to-orange-600/30"
                )}>
                  <Star className="h-3.5 w-3.5 text-white" />
                </div>
                <span>My Feed</span>
              </Link>
              <Link
                to="/all-channels"
                className={cn(
                  "flex items-center gap-2 transition-all duration-200 hover:text-gray-900 dark:hover:text-white group",
                  isActive("/all-channels") ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  isActive("/all-channels") 
                    ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25" 
                    : "bg-gradient-to-br from-purple-500/20 to-pink-600/20 group-hover:from-purple-500/30 group-hover:to-pink-600/30"
                )}>
                  <Users className="h-3.5 w-3.5 text-white" />
                </div>
                <span>All Channels</span>
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Link to="/select-favorites">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="p-1 rounded-md bg-gradient-to-br from-amber-500/20 to-yellow-500/20 mr-2 group-hover:from-amber-500/30 group-hover:to-yellow-500/30 transition-all duration-200">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  Select Favorites
                </Button>
              </Link>
              <Link to="/generate-feed">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="p-1 rounded-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 mr-2 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-200">
                    <Upload className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  Upload Subscriptions
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-200">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
              </Button>
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
} 