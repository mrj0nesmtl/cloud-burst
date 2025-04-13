# Session 40 Resources: Camera & Media Implementation

## Key File Paths

### Camera System Core

```
# Core Camera Components
src/components/camera/camera-capture.tsx             # Main camera capture component
src/components/camera/media-preview.tsx              # Preview component for captured media
src/components/camera/camera-controls.tsx            # Camera control buttons and settings
src/components/camera/capture-modes.tsx              # Single, burst, and video capture modes

# Camera Utilities
src/lib/camera/camera-access.ts                      # Device access and permissions handling
src/lib/camera/media-processor.ts                    # Client-side image/video processing
src/lib/camera/capture-session.ts                    # Session management for captures
src/lib/camera/device-detection.ts                   # Camera capability detection

# Camera Hooks
src/hooks/useCamera.ts                               # Camera access and control hook
src/hooks/useMediaCapture.ts                         # Media capture state management
src/hooks/useDeviceSettings.ts                       # Camera settings management
src/hooks/useMediaProcessing.ts                      # Post-capture processing
```

### Media Upload System

```
# Upload Components
src/components/upload/upload-dropzone.tsx            # Drag-and-drop upload component
src/components/upload/upload-progress.tsx            # Upload progress indicator
src/components/upload/media-uploader.tsx             # Combined upload component
src/components/upload/batch-uploader.tsx             # Multiple file upload handler

# Upload Utilities
src/lib/upload/client-compression.ts                 # Client-side image/video compression
src/lib/upload/upload-queue.ts                       # Upload queue management
src/lib/upload/background-uploader.ts                # Background upload processing
src/lib/upload/retry-manager.ts                      # Upload retry logic
```

### Gallery Integration

```
# Gallery Components
src/components/gallery/real-time-gallery.tsx         # Gallery with real-time updates
src/components/gallery/upload-preview.tsx            # Preview of uploaded media in gallery
src/components/gallery/capture-to-gallery.tsx        # Direct camera-to-gallery workflow
src/components/gallery/grid-manager.tsx              # Dynamic grid layout manager

# Integration Points
src/lib/gallery/upload-integration.ts                # Upload to gallery integration
src/lib/gallery/camera-integration.ts                # Camera to gallery integration
src/lib/gallery/real-time-updates.ts                 # Real-time gallery updates
```

### AI Integration

```
# AI Components
src/components/ai/enhancement-pipeline.tsx           # Image enhancement UI
src/components/ai/facial-recognition.tsx             # Facial recognition component
src/components/ai/object-detection.tsx               # Object detection for tagging
src/components/ai/smart-crop.tsx                     # Intelligent cropping component

# AI Utilities
src/lib/ai/tensorflow-loader.ts                      # TensorFlow.js model loading
src/lib/ai/image-enhancement.ts                      # Image enhancement algorithms
src/lib/ai/face-detection.ts                         # Face detection and grouping
src/lib/ai/object-recognition.ts                     # Object recognition for tagging
```

## Implementation References

### Camera API Resources

- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
- [ImageCapture API](https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Browser compatibility table](https://caniuse.com/?search=getUserMedia)

### Upload & Media Processing

- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Fetch_API)
- [IndexedDB for offline storage](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### TensorFlow.js Resources

- [TensorFlow.js Official Documentation](https://www.tensorflow.org/js)
- [TensorFlow.js Models](https://github.com/tensorflow/tfjs-models)
- [Face-API.js](https://github.com/justadudewhohacks/face-api.js/)
- [COCO-SSD Object Detection](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
- [Image Classification](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)

## Code Examples

### Camera Access Implementation

```typescript
// src/hooks/useCamera.ts

import { useState, useEffect, useCallback } from 'react';
import { CameraSettings, CameraDevice } from '@/types/camera';

export function useCamera(initialSettings?: Partial<CameraSettings>) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [settings, setSettings] = useState<CameraSettings>({
    facingMode: initialSettings?.facingMode || 'environment',
    aspectRatio: initialSettings?.aspectRatio || 4/3,
    width: initialSettings?.width || { ideal: 1920 },
    height: initialSettings?.height || { ideal: 1080 },
    frameRate: initialSettings?.frameRate || { ideal: 30 },
    ...initialSettings
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<PermissionState | null>(null);

  // ... implementation details ...

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check permission
      const permissionResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermission(permissionResult.state);
      
      if (permissionResult.state === 'denied') {
        throw new Error('Camera permission denied');
      }
      
      // Get available devices
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices.map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`,
      })));
      
      // Get media stream
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: activeDevice ? { exact: activeDevice } : undefined,
          facingMode: !activeDevice ? settings.facingMode : undefined,
          aspectRatio: settings.aspectRatio,
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
        },
        audio: false,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      return mediaStream;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start camera'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeDevice, settings]);

  // ... more implementation details ...

  return {
    stream,
    devices,
    activeDevice,
    settings,
    error,
    loading,
    permission,
    startCamera,
    stopCamera,
    switchCamera,
    updateSettings,
    takePhoto,
    // ... other functions ...
  };
}
```

### Media Upload Implementation

```typescript
// src/hooks/useMediaUpload.ts

import { useState, useCallback } from 'react';
import { compressImage, compressVideo } from '@/lib/upload/client-compression';
import { uploadToStorage } from '@/lib/upload/upload-service';
import { addToUploadQueue, removeFromQueue } from '@/lib/upload/upload-queue';
import { MediaUploadResult, UploadOptions, UploadProgress } from '@/types/upload';

export function useMediaUpload(options?: Partial<UploadOptions>) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    totalFiles: 0,
    uploadedFiles: 0,
    currentFileProgress: 0,
    overallProgress: 0,
  });
  const [results, setResults] = useState<MediaUploadResult[]>([]);
  const [errors, setErrors] = useState<Error[]>([]);

  const defaultOptions: UploadOptions = {
    compress: true,
    maxSizeMB: 5,
    maxWidthOrHeight: 2048,
    useQueue: true,
    retryCount: 3,
    retryDelay: 2000,
    parallelUploads: 3,
    metadata: {},
    ...options
  };

  const uploadFile = useCallback(async (file: File): Promise<MediaUploadResult> => {
    try {
      // Compress if needed
      let processedFile = file;
      if (defaultOptions.compress) {
        if (file.type.startsWith('image/')) {
          processedFile = await compressImage(file, {
            maxSizeMB: defaultOptions.maxSizeMB,
            maxWidthOrHeight: defaultOptions.maxWidthOrHeight,
          });
        } else if (file.type.startsWith('video/')) {
          processedFile = await compressVideo(file, {
            maxSizeMB: defaultOptions.maxSizeMB * 5, // Videos get more space
          });
        }
      }
      
      // Upload to storage
      const result = await uploadToStorage(processedFile, {
        onProgress: (progress) => {
          setProgress(prev => ({
            ...prev,
            currentFileProgress: progress,
            overallProgress: (prev.uploadedFiles + progress / 100) / prev.totalFiles * 100
          }));
        },
        metadata: defaultOptions.metadata,
        retryCount: defaultOptions.retryCount,
        retryDelay: defaultOptions.retryDelay,
      });
      
      return {
        id: result.id,
        originalFile: file,
        processedFile,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        type: file.type,
        size: processedFile.size,
        originalSize: file.size,
        compressionRatio: file.size / processedFile.size,
        metadata: result.metadata,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }, [defaultOptions]);

  // ... more implementation details ...

  return {
    uploadFiles,
    uploadFile,
    cancelUpload,
    retryFailed,
    uploading,
    progress,
    results,
    errors,
  };
}
```

### TensorFlow.js Integration

```typescript
// src/lib/ai/face-detection.ts

import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import { loadModels, ensureModelLoaded } from './tensorflow-loader';
import { FaceDetectionResult, FaceDetectionOptions } from '@/types/ai';

let modelsLoaded = false;

export async function initFaceDetection(): Promise<void> {
  if (modelsLoaded) return;
  
  await tf.ready();
  await loadModels([
    faceapi.nets.ssdMobilenetv1,
    faceapi.nets.faceLandmark68Net,
    faceapi.nets.faceRecognitionNet,
  ]);
  
  modelsLoaded = true;
}

export async function detectFaces(
  imageOrVideo: HTMLImageElement | HTMLVideoElement | ImageData,
  options?: Partial<FaceDetectionOptions>
): Promise<FaceDetectionResult[]> {
  await ensureModelLoaded(initFaceDetection);
  
  const defaultOptions: FaceDetectionOptions = {
    minConfidence: 0.5,
    withLandmarks: true,
    withDescriptors: options?.needsRecognition || false,
    ...options
  };
  
  // Configure detection parameters
  const detectionOptions = new faceapi.SsdMobilenetv1Options({
    minConfidence: defaultOptions.minConfidence,
  });
  
  // Perform detection
  let detections;
  if (defaultOptions.withDescriptors) {
    detections = await faceapi
      .detectAllFaces(imageOrVideo, detectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();
  } else if (defaultOptions.withLandmarks) {
    detections = await faceapi
      .detectAllFaces(imageOrVideo, detectionOptions)
      .withFaceLandmarks();
  } else {
    detections = await faceapi
      .detectAllFaces(imageOrVideo, detectionOptions);
  }
  
  // Map to our internal format
  return detections.map((detection, index) => ({
    id: `face-${index}`,
    box: detection.detection.box.toJSON(),
    landmarks: detection.landmarks?.positions.map(p => ({ x: p.x, y: p.y })),
    descriptor: detection.descriptor?.toString(),
    confidence: detection.detection.score,
  }));
}

export function groupSimilarFaces(
  faces: FaceDetectionResult[],
  similarityThreshold = 0.6
): Record<string, FaceDetectionResult[]> {
  if (!faces.length) return {};
  if (!faces[0].descriptor) {
    throw new Error('Face descriptors required for grouping');
  }
  
  const groups: Record<string, FaceDetectionResult[]> = {};
  
  // Helper to compute distance between face descriptors
  const computeDistance = (desc1: Float32Array, desc2: Float32Array): number => {
    return faceapi.euclideanDistance(desc1, desc2);
  };
  
  // Group similar faces
  for (const face of faces) {
    const descriptor = new Float32Array(face.descriptor!.split(',').map(Number));
    
    let matched = false;
    for (const groupId in groups) {
      const groupFaces = groups[groupId];
      const groupDesc = new Float32Array(groupFaces[0].descriptor!.split(',').map(Number));
      
      if (computeDistance(descriptor, groupDesc) < similarityThreshold) {
        groups[groupId].push(face);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      const newGroupId = `group-${Object.keys(groups).length + 1}`;
      groups[newGroupId] = [face];
    }
  }
  
  return groups;
}
```

## Database Schema

### Media Table

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For videos/audio (in seconds)
  content_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'active', 'flagged', 'deleted')),
  metadata JSONB DEFAULT '{}',
  ai_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_or_guest_check CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);
```

### Media Tags Table

```sql
CREATE TABLE media_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  confidence REAL, -- For AI-generated tags
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, tag)
);
```

### Faces Table

```sql
CREATE TABLE faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  box_x INTEGER NOT NULL,
  box_y INTEGER NOT NULL,
  box_width INTEGER NOT NULL,
  box_height INTEGER NOT NULL,
  descriptor TEXT, -- Face encoding for recognition
  confidence REAL NOT NULL,
  recognized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Camera & Upload API

```
POST /api/upload
- Uploads one or more media files
- Returns metadata about uploaded files

POST /api/upload/batch
- Uploads a batch of files with progress tracking
- Supports resumable uploads

GET /api/upload/status/:batchId
- Gets status of a batch upload

DELETE /api/upload/:mediaId
- Deletes an uploaded media file
```

### AI Processing API

```
POST /api/ai/process/:mediaId
- Processes a media file with AI features
- Returns AI metadata (faces, tags, etc.)

POST /api/ai/faces/group
- Groups similar faces across multiple media items

POST /api/ai/enhance/:mediaId
- Enhances a media file with AI (brightness, contrast, etc.)

POST /api/ai/tags/:mediaId
- Generates tags for a media file using object recognition
```

### Gallery Integration API

```
GET /api/gallery/:eventId/realtime
- Gets real-time updates to gallery items

POST /api/gallery/:eventId/captured
- Adds camera-captured media directly to gallery

PATCH /api/gallery/organize
- Updates gallery organization (sorting, grouping)
```

## Mobile Device Considerations

### Device Capabilities

| Capability | iOS Safari | Chrome Android | Firefox Android | Notes |
|------------|------------|----------------|-----------------|-------|
| getUserMedia | ✅ | ✅ | ✅ | Requires HTTPS |
| ImageCapture API | ❌ | ✅ | ❌ | Fallback needed for iOS |
| Service Workers | ✅ | ✅ | ✅ | Background processing |
| TensorFlow.js | ✅* | ✅ | ✅ | *Limited on older iOS |
| WebGL | ✅ | ✅ | ✅ | Performance varies |
| IndexedDB | ✅ | ✅ | ✅ | Offline storage |
| Background Fetch | ❌ | ✅* | ❌ | *Chrome 84+ |

### Common Issues

1. **Memory Limitations**
   - iOS Safari has a lower memory limit (~650MB on many devices)
   - Solution: Implement progressive loading and unloading of resources

2. **Camera Orientation**
   - iOS/Android handle camera orientation differently
   - Solution: Use `exifr` to parse orientation metadata and correct it

3. **Permission Handling**
   - iOS requires user interaction to grant camera permission
   - Solution: Clear UI to request permission with proper context

4. **Processing Performance**
   - TensorFlow.js performance varies greatly between devices
   - Solution: Implement adaptive quality settings based on device capability

## Testing Resources

### Camera Testing

- Chrome's device mode for emulating mobile devices
- Chrome's media devices emulation for testing camera
- Remote debugging on real iOS/Android devices

### Upload Testing

- Chrome DevTools network throttling for slow connections
- Service worker testing in Chrome DevTools
- IndexedDB testing for offline functionality

### AI Testing

- TensorFlow.js Vis for visualizing model performance
- Sample datasets for testing recognition accuracy
- Performance profiling for model optimization

## Performance Benchmarks

| Feature | Target Time | Minimum Acceptable | Notes |
|---------|------------|-------------------|-------|
| Camera initialization | < 500ms | < 1.5s | Time to first frame |
| Photo capture | < 200ms | < 500ms | Shutter to preview |
| Image upload (3MB) | < 2s | < 5s | On 4G connection |
| Facial recognition | < 800ms | < 2s | Per image on mid-range device |
| Enhancement processing | < 1s | < 3s | Per image on mid-range device |

## Documentation References

- [Camera Integration Architecture](../../architecture/camera_integration.md)
- [Upload System Design](../../architecture/upload_system.md)
- [AI Feature Implementation Guide](../../development/ai_features.md)
- [Media Processing Pipeline](../../architecture/media_processing.md)
- [Gallery Real-time Updates](../../architecture/realtime_gallery.md)

## Relevant Libraries

- TensorFlow.js - AI and machine learning
- Face-API.js - Face detection and recognition
- COCO-SSD - Object detection
- Compressor.js - Client-side image compression
- Uppy.js - Advanced upload functionality
- Exifr - EXIF metadata parsing
- MediaPipe - Advanced media processing

## Support Contacts

- AI Implementation: ai-team@cloudburst.internal
- Camera Integration: camera-team@cloudburst.internal
- Upload System: upload-team@cloudburst.internal 