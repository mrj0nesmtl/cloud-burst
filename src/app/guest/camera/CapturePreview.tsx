"use client";

import { useState } from 'react';
import Image from 'next/image';
import { 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Download, 
  Crop, 
  Sliders 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface CapturePreviewProps {
  photoUrl: string;
  onUpload: (photoBlob: Blob) => void;
  onRetake: () => void;
  onCancel: () => void;
}

export function CapturePreview({ 
  photoUrl, 
  onUpload, 
  onRetake,
  onCancel 
}: CapturePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState('preview');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filter, setFilter] = useState('none');
  
  // Fetch the image as a blob for processing
  const getPhotoBlob = async (): Promise<Blob> => {
    const response = await fetch(photoUrl);
    return await response.blob();
  };
  
  const handleUpload = async () => {
    const blob = await getPhotoBlob();
    onUpload(blob);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setCurrentTab('basic');
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edits
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFilter('none');
  };
  
  const handleSaveEdit = () => {
    setIsEditing(false);
    // In a real implementation, we would apply the edits to the image here
    // For now, we'll just close the edit mode
  };
  
  const imageStyle = {
    filter: `
      brightness(${brightness}%) 
      contrast(${contrast}%) 
      saturate(${saturation}%)
      ${filter !== 'none' ? `${filter}(1)` : ''}
    `
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {isEditing ? 'Edit Photo' : 'Preview Photo'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Image preview area */}
        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
          <Image
            src={photoUrl}
            alt="Captured photo"
            className="max-h-full max-w-full object-contain"
            width={800}
            height={600}
            style={imageStyle}
          />
        </div>
        
        {/* Edit controls */}
        {isEditing && (
          <div className="bg-background border-t p-4">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="crop">Crop</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brightness">Brightness</Label>
                    <span className="text-xs text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider 
                    id="brightness"
                    min={50} 
                    max={150} 
                    step={1} 
                    value={[brightness]} 
                    onValueChange={(value) => setBrightness(value[0])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contrast">Contrast</Label>
                    <span className="text-xs text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider 
                    id="contrast"
                    min={50} 
                    max={150} 
                    step={1} 
                    value={[contrast]} 
                    onValueChange={(value) => setContrast(value[0])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="saturation">Saturation</Label>
                    <span className="text-xs text-muted-foreground">{saturation}%</span>
                  </div>
                  <Slider 
                    id="saturation"
                    min={0} 
                    max={200} 
                    step={1} 
                    value={[saturation]} 
                    onValueChange={(value) => setSaturation(value[0])} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="filters" className="space-y-4 mt-4">
                <RadioGroup 
                  value={filter} 
                  onValueChange={setFilter}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="space-y-2">
                    <RadioGroupItem 
                      value="none" 
                      id="filter-none" 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor="filter-none"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-md border-2 border-muted p-2 hover:border-accent cursor-pointer",
                        filter === 'none' && "border-primary"
                      )}
                    >
                      <div className="h-16 w-16 rounded overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-pink-100"></div>
                      </div>
                      <span className="text-xs">None</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <RadioGroupItem 
                      value="grayscale" 
                      id="filter-grayscale" 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor="filter-grayscale"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-md border-2 border-muted p-2 hover:border-accent cursor-pointer",
                        filter === 'grayscale' && "border-primary"
                      )}
                    >
                      <div className="h-16 w-16 rounded overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-600 filter grayscale"></div>
                      </div>
                      <span className="text-xs">B&W</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <RadioGroupItem 
                      value="sepia" 
                      id="filter-sepia" 
                      className="sr-only"
                    />
                    <Label 
                      htmlFor="filter-sepia"
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-md border-2 border-muted p-2 hover:border-accent cursor-pointer",
                        filter === 'sepia' && "border-primary"
                      )}
                    >
                      <div className="h-16 w-16 rounded overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-br from-yellow-200 to-yellow-600 filter sepia"></div>
                      </div>
                      <span className="text-xs">Sepia</span>
                    </Label>
                  </div>
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="crop" className="space-y-4 mt-4">
                <div className="flex items-center justify-center p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Crop functionality would be implemented here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Footer with action buttons */}
      <div className="p-4 border-t flex items-center justify-between bg-background">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Check className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRetake}
                className="rounded-full h-12 w-12"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleEdit}
                className="rounded-full h-12 w-12"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
            <Button size="lg" onClick={handleUpload} className="rounded-full px-6">
              <Check className="h-5 w-5 mr-2" />
              Upload
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 