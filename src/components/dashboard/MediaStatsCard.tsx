"use client";

import { useState, useEffect } from "react";
import { useMediaStore } from "@/store/media-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Image, Film, Upload, CheckCircle, Clock, XCircle } from "lucide-react";

interface MediaStatsCardProps {
  eventId: string;
}

export function MediaStatsCard({ eventId }: MediaStatsCardProps) {
  const {
    getMediaStats,
    mediaStats,
    isLoadingMediaStats,
    error,
  } = useMediaStore();
  
  // Fetch stats on mount
  useEffect(() => {
    getMediaStats(eventId);
  }, [eventId, getMediaStats]);
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media Statistics</CardTitle>
          <CardDescription>Error loading media statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Failed to load media statistics. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Media Gallery</span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${eventId}/media`}>
              View All
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>
          Photos and videos from this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingMediaStats ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Media</p>
                <p className="text-2xl font-bold">
                  {mediaStats.total}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 mx-auto">
                    <Image size={20} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{mediaStats.photos}</p>
                  <p className="text-xs text-muted-foreground">Photos</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-700 mx-auto">
                    <Film size={20} />
                  </div>
                  <p className="mt-1 text-sm font-medium">{mediaStats.videos}</p>
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status" className="pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                        <span>Approved</span>
                      </div>
                      <span className="font-medium">{mediaStats.approved}</span>
                    </div>
                    <Progress value={(mediaStats.approved / Math.max(mediaStats.total, 1)) * 100} className="h-2 bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4 text-amber-500" />
                        <span>Pending</span>
                      </div>
                      <span className="font-medium">{mediaStats.pending}</span>
                    </div>
                    <Progress value={(mediaStats.pending / Math.max(mediaStats.total, 1)) * 100} className="h-2 bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                        <span>Rejected</span>
                      </div>
                      <span className="font-medium">{mediaStats.rejected}</span>
                    </div>
                    <Progress value={(mediaStats.rejected / Math.max(mediaStats.total, 1)) * 100} className="h-2 bg-muted" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Recent Uploads</p>
                      <p className="text-2xl font-bold">
                        {mediaStats.recentUploads || 0}
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                          last 7 days
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold">{mediaStats.pending}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button asChild variant="outline">
                      <Link href={`/events/${eventId}/media/upload`}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Media
                      </Link>
                    </Button>
                    
                    {mediaStats.pending > 0 && (
                      <Button asChild>
                        <Link href={`/events/${eventId}/media/moderation`}>
                          Moderate
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="storage" className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used Storage</span>
                      <span className="font-medium">
                        {mediaStats.totalSize ? formatBytes(mediaStats.totalSize) : "0 KB"}
                      </span>
                    </div>
                    <Progress value={Math.min((mediaStats.totalSize || 0) / (mediaStats.storageLimit || 1) * 100, 100)} className="h-2 bg-muted" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round((mediaStats.totalSize || 0) / (mediaStats.storageLimit || 1) * 100)}% used</span>
                      <span>Limit: {formatBytes(mediaStats.storageLimit || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Photo Storage</p>
                      <p className="text-sm font-medium">
                        {mediaStats.photoSize ? formatBytes(mediaStats.photoSize) : "0 KB"}
                      </p>
                    </div>
                    
                    <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Video Storage</p>
                      <p className="text-sm font-medium">
                        {mediaStats.videoSize ? formatBytes(mediaStats.videoSize) : "0 KB"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
} 