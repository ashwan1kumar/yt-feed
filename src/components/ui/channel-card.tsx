import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, PlayCircle, MapPin } from "lucide-react";
import type { ChannelInfo } from "@/services/youtube";
import { formatNumber } from "@/utils/format";

interface ChannelCardProps {
  channel: ChannelInfo;
  onClick?: () => void;
}

export function ChannelCard({ channel, onClick }: ChannelCardProps) {
  // Generate a consistent color based on channel name
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

  const gradientColor = getChannelColor(channel.name);

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-border/50 bg-white dark:bg-card shadow-lg hover:shadow-2xl group relative h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-3 relative">
        <div className="flex items-start gap-3">
          {/* Profile Image with gradient border */}
          <div className="relative group/avatar flex-shrink-0">
            <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition duration-300`} />
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-background border-2 border-white dark:border-background">
              {channel.profileImage ? (
                <img 
                  src={channel.profileImage} 
                  alt={channel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default avatar on error
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=random`;
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientColor}`}>
                  <Users className="w-7 h-7 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Channel Name and Handle */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1 text-gray-900 dark:text-foreground group-hover:text-gray-700 dark:group-hover:text-primary transition-colors">{channel.name}</h3>
            {channel.customUrl && (
              <p className="text-sm text-gray-600 dark:text-muted-foreground truncate">
                {channel.customUrl.replace('https://www.youtube.com/', '')}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 relative flex-1 flex flex-col">
        {/* Stats with colorful icons */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 group/stat">
            <div className="p-1 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-sm">
              <Users className="w-3 h-3" />
            </div>
            <span className="font-medium text-gray-900 dark:text-foreground">{formatNumber(channel.subscriberCount)}</span>
            <span className="text-gray-600 dark:text-muted-foreground text-xs">subs</span>
          </div>
          <div className="flex items-center gap-1.5 group/stat">
            <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
              <PlayCircle className="w-3 h-3" />
            </div>
            <span className="font-medium text-gray-900 dark:text-foreground">{formatNumber(channel.videoCount)}</span>
            <span className="text-gray-600 dark:text-muted-foreground text-xs">videos</span>
          </div>
        </div>
        
        {/* Description - fixed height */}
        <div className="flex-1">
          <CardDescription className="line-clamp-2 text-xs h-8">
            {channel.description || "No description available"}
          </CardDescription>
        </div>
        
        {/* Categories/Tags with gradient badges - fixed section */}
        <div className="mt-auto">
          {channel.categories.length > 0 ? (
            <div className="flex flex-wrap gap-1 h-6 overflow-hidden">
              {channel.categories.slice(0, 2).map((category, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-gray-100 dark:bg-secondary/80 hover:bg-gray-200 dark:hover:bg-secondary transition-all h-5"
                >
                  {category}
                </Badge>
              ))}
              {channel.categories.length > 2 && (
                <Badge variant="outline" className="text-xs h-5">
                  +{channel.categories.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <div className="h-6" />
          )}
        </div>
        
        {/* Country with colorful icon */}
        {channel.country && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-muted-foreground">
            <div className="p-0.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm">
              <MapPin className="w-2.5 h-2.5" />
            </div>
            <span>{channel.country}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 