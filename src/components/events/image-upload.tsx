import { useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ImageUpload({ 
  onImageSelected, 
  label = "Image",
  description = "Upload an image or provide a URL"
}: { 
  onImageSelected: (file: File | string) => void,
  label?: string,
  description?: string
}) {
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageSelected(file);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUrlChange = (url: string) => {
    setPreview(url);
    onImageSelected(url);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Image URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
              </div>
              <Input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </TabsContent>
        
        <TabsContent value="url">
          <Input 
            type="url" 
            placeholder="https://example.com/image.jpg"
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </TabsContent>
      </Tabs>
      
      {preview && (
        <div className="relative aspect-video rounded-md overflow-hidden border">
          <img 
            src={preview} 
            alt="Preview" 
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
} 