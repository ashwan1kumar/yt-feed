import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Search, Star, AlertCircle, Sparkles } from "lucide-react";
import type { Channel } from "@/services/youtube";

export default function FavoriteChannelsPage() {
  const navigate = useNavigate();
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [saved, setSaved] = useState(false);

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

    // Load existing favorites if any
    const storedFavorites = localStorage.getItem('favoriteChannels');
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites);
        if (parsed.channels && Array.isArray(parsed.channels)) {
          const favoriteIds = new Set<string>(parsed.channels.map((ch: Channel) => ch.channelId));
          setSelectedChannels(favoriteIds);
        }
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  const toggleChannel = (channelId: string) => {
    const newSelected = new Set(selectedChannels);
    if (newSelected.has(channelId)) {
      newSelected.delete(channelId);
    } else {
      if (newSelected.size < 10) {
        newSelected.add(channelId);
      }
    }
    setSelectedChannels(newSelected);
  };

  const filteredChannels = allChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    const favoriteChannels = allChannels.filter(ch => selectedChannels.has(ch.channelId));
    localStorage.setItem('favoriteChannels', JSON.stringify({ channels: favoriteChannels }));
    setSaved(true);
    
    // Redirect to feed
    setTimeout(() => {
      navigate('/feed');
    }, 1500);
  };

  if (allChannels.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-600/10 to-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="max-w-md shadow-2xl border border-gray-200 dark:border-border/50 bg-white dark:bg-card relative">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-foreground">No channels found</p>
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              Please upload your YouTube subscriptions first
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen -mt-24">
      {/* Background effects - extended to cover header area */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto pt-32 pb-8 px-4 max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/25">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-yellow-600 dark:from-primary dark:via-orange-600 dark:to-yellow-600 bg-clip-text text-transparent">
              Select Your Favorite Channels
            </h1>
          </div>
          <p className="text-gray-600 dark:text-muted-foreground ml-14">
            Choose up to 10 channels to appear in your main feed ({selectedChannels.size}/10 selected)
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-muted-foreground w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-background transition-all text-gray-900 dark:text-foreground"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredChannels.map((channel, index) => {
            const isSelected = selectedChannels.has(channel.channelId);
            const isDisabled = !isSelected && selectedChannels.size >= 10;
            
            return (
              <motion.div
                key={channel.channelId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.01 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'border-orange-400 dark:border-primary bg-orange-50 dark:bg-primary/10 shadow-lg' 
                      : isDisabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50' 
                        : 'border-gray-200 dark:border-border/50 bg-white dark:bg-gray-900/50 hover:border-orange-300 dark:hover:border-primary hover:shadow-md'
                  }`}
                  onClick={() => !isDisabled && toggleChannel(channel.channelId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-gray-900 dark:text-gray-100">{channel.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {channel.url || `Channel ID: ${channel.channelId}`}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-400 dark:border-gray-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredChannels.length === 0 && (
          <Card className="bg-white dark:bg-card border border-gray-200 dark:border-border/50">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-foreground">No channels found</p>
              <p className="text-gray-600 dark:text-muted-foreground">
                Try adjusting your search query
              </p>
            </CardContent>
          </Card>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sticky bottom-0 pb-8 pt-8"
        >
          <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-sm border border-gray-200 dark:border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-foreground">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                </div>
                Your Favorite Channels
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-muted-foreground">
                {selectedChannels.size === 0 
                  ? "Select up to 10 channels for your main feed" 
                  : `${selectedChannels.size} of 10 channels selected`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedChannels.size > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {allChannels
                    .filter(ch => selectedChannels.has(ch.channelId))
                    .map(channel => (
                      <span
                        key={channel.channelId}
                        className="px-3 py-1 bg-orange-100 dark:bg-primary/10 text-orange-700 dark:text-primary rounded-full text-sm flex items-center gap-1"
                      >
                        {channel.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChannel(channel.channelId);
                          }}
                          className="ml-1 hover:text-orange-900 dark:hover:text-primary-foreground transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                disabled={selectedChannels.size === 0 || saved}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved! Redirecting to feed...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Save Favorites & Continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 