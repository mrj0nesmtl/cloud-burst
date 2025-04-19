// ... existing code ...

  // Upload the captured photo
  const uploadPhoto = async (photoId: string): Promise<boolean> => {
    if (!capturedPhotos || !eventId || !invitationToken) return false;
    
    // Find the photo by ID
    const photo = capturedPhotos.find(p => p.id === photoId);
    if (!photo) return false;
    
    try {
      // Update progress status
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          status: 'uploading',
          progress: 10,
          message: 'Starting upload...'
        }
      }));
      
      // Convert data URL to blob
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();
      
      // Update progress
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          progress: 25,
          message: 'Preparing file...'
        }
      }));
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `${photoId}.jpg`);
      formData.append('eventId', eventId);
      formData.append('invitationToken', invitationToken);
      formData.append('metadata', JSON.stringify({
        is_camera_capture: true,
        device_info: navigator.userAgent,
        captured_at: new Date().toISOString(),
        photo_id: photoId,
        invitation_token: invitationToken
      }));
      
      // Update progress
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          progress: 35,
          message: 'Uploading to server...'
        }
      }));
      
      // Send to API
      const uploadResponse = await fetch('/api/guest/upload', {
        method: 'POST',
        body: formData
      });
      
      // Update progress
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          progress: 75,
          message: 'Processing upload...'
        }
      }));
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload photo');
      }
      
      const result = await uploadResponse.json();
      
      // Update progress to complete
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          status: 'complete',
          progress: 100,
          message: 'Upload complete!',
          mediaId: result.mediaId,
          url: result.url
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // Update status to error
      setUploadStatus(prev => ({
        ...prev,
        [photoId]: {
          ...prev[photoId],
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      
      return false;
    }
  };
// ... existing code ... 