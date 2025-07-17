import { Card, CardContent } from "@/components/ui/card";

export function VideoSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-5 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
      </CardContent>
    </Card>
  );
} 