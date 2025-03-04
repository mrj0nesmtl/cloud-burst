# 🎟️ **Invited Guest - User Flow Design Document**  

## Cloud Burst  
📅 *Updated: March 3, 2025*  
📊 *Version: 0.7.0*

## 📌 Situational Abstract
With the implementation of enhanced authentication, role-based access control, and custom event URLs, Cloud Burst's invited guest flow has been refined to provide a secure yet seamless experience. The platform now features improved state management with Zustand and optimized data fetching with TanStack Query, while maintaining our streamlined approach for the April 1, 2025 launch.

The invited guest flow is approximately 80% complete, with current development focused on finalizing the QR code-based authentication process and enhancing the mobile experience. Recent implementations of multiple gallery layouts (grid, masonry, slideshow) and tag-based filtering have significantly improved the guest experience, allowing for more intuitive navigation and content discovery.

## 🔍 Introduction  
Cloud Burst is an **event photography platform** that enables guests to capture, upload, and share photos at **live events** such as weddings, parties, and corporate gatherings.  

📸 *This document details the guest user flow, authentication options, and the event gallery's temporary nature.*  

---

## 🔒 **Security Implementation** [Enhanced]

### 🛡️ **Protected Routes**
- ✅ Rate limiting on all routes
- ✅ Role-based middleware
- ✅ Enhanced session management
- ✅ Secure cookie handling
- ✅ Comprehensive error boundaries
- ✅ Row Level Security policies
- ✅ Permission-based access controls

### 🔐 **Guest Authentication** [Implementation Status: 80%]
- ✅ Secure session handling
- ✅ Protected route system
- ✅ Rate limited endpoints
- ✅ Cookie security
- ✅ QR code-based access
- ✅ Temporary access tokens
- 🟡 Social authentication integration (70% complete)
- 🟡 Guest profile persistence (60% complete)

### ⚙️ **User Settings**
- ✅ Profile customization
- ✅ Theme preferences (light/dark/system)
- ✅ Language selection
- 🟡 Notification management (60% complete)
- 🟡 Display options (70% complete)

## 👤 Guest User Journey  

### 📩 **Step 1: Invitation & QR Code Distribution**  
✅ Guests receive an **email or physical invitation** containing a unique **QR code**
- Uses `<AspectRatio>` for QR code display
- `<Card>` component for email template
- `<Button>` for direct gallery access
- ✅ Custom event URL integration
- ✅ Email template customization

### 🎉 **Step 2: Arrival & QR Code Scan**  
✅ Guests scan the **QR code** using their smartphone camera
- `<Dialog>` for camera access permission
- `<Toast>` for scan confirmation
- `<Progress>` for loading states
- ✅ Progressive Web App capabilities
- ✅ Offline scanning support

### 🔑 **Step 3: Authentication & Settings**  
✅ **Guest Mode** – Instant access, no sign-up required
🟡 **Social Sign-In** – Login via Google, Apple, or Facebook (70% complete)
✅ **Profile Setup** – Optional profile customization
- `<Tabs>` for auth options
- `<Form>` with validation for guest info
- `<Button>` variants for social login
- `<Alert>` for authentication status
- `<PreferencesForm>` for settings
- `<NotificationsForm>` for alerts
- ✅ Role-based access control
- ✅ Permission-based UI rendering

### 📷 **Step 4: Photo Capture & Upload**  
✅ **Capture & Upload** button opens the camera/file picker
🟡 **AI-enhanced processing** automatically improves image quality (Planned for post-launch)
- `<DropZone>` for file uploads
- `<Progress>` for upload status
- `<Carousel>` for image preview
- `<Skeleton>` for loading states
- `<Toast>` for processing notifications
- ✅ Multiple file selection
- ✅ Drag-and-drop support
- ✅ Format validation
- ✅ Size optimization

### 🖼️ **Step 5: Live Photo Gallery**  
✅ A **real-time photo wall** updates as guests upload images
✅ **Interactive features** – Like, share, and (optionally) comment
🟡 **Tag-based filtering** allows guests to organize by categories (80% complete)
- `<ScrollArea>` for gallery view
- `<AspectRatio>` for consistent image display
- `<HoverCard>` for image details
- `<Dialog>` for full-screen view
- `<Select>` for filter options
- ✅ Multiple gallery layouts (Grid, Masonry, Slideshow)
- ✅ Responsive design for all devices
- 🟡 Download functionality (60% complete)

### ⏳ **Step 6: Post-Event Access**  
✅ Event photos remain available **for a limited time (1-4 weeks)**
✅ **Guests receive a follow-up email** with the gallery link
- `<Calendar>` for expiry countdown
- `<Alert>` for access expiration notices
- `<Button>` for download options
- ✅ Custom event URL for sharing
- 🟡 Bulk download options (50% complete)

---

## 🎨 Page Layouts & Components  

### 🏠 **Welcome Page**  
✅ Event branding & high-quality visuals
✅ CTA buttons: *Join as Guest* or *Sign In*
- `<NavigationMenu>` for main navigation
- `<Sheet>` for mobile menu
- `<AspectRatio>` for hero images
- `<Card>` for feature highlights
- ✅ Custom event branding
- ✅ Responsive design
- ✅ Role-based navigation

### 📷 **Photo Capture & Upload Page**  
✅ Simple **camera & file upload interface**
🟡 AI-enhanced processing for **best image quality** (Planned for post-launch)
- `<Tabs>` for capture/upload options
- `<DropZone>` for file handling
- `<Slider>` for image adjustments
- `<Progress>` for processing status
- ✅ Multiple file upload
- ✅ Progress indicators
- ✅ Error handling

### 🏆 **Live Gallery (Photo Wall)**  
✅ **Dynamic grid layout** with uploaded images
✅ **Like, share, and comment** functionality
- `<ScrollArea>` for infinite scroll
- `<AspectRatio>` for image containers
- `<Dialog>` for image modals
- `<Popover>` for sharing options
- `<Form>` for comments
- ✅ Multiple gallery layouts
- ✅ Tag-based filtering
- 🟡 Download options (60% complete)

### 📨 **Post-Event Page**  
✅ **Reminder & persistent gallery link**
🟡 **Download & sharing options** for guests (60% complete)
- `<Card>` for download options
- `<Button>` for actions
- `<Alert>` for expiry notices
- ✅ Custom event URL
- 🟡 Bulk download functionality (50% complete)

### ⚙️ **Settings Page**
✅ Profile management & customization
✅ Theme & language preferences
🟡 Notification settings (60% complete)
- `<Tabs>` for settings navigation
- `<Form>` for preferences
- `<Select>` for options
- `<Switch>` for toggles
- `<Toast>` for updates
- ✅ Role-based settings access
- ✅ Permission-based UI rendering

---

## 🎯 User Benefits  

✅ **Frictionless Access** – No app installation needed
🟡 **AI-Enhanced Images** – Automatic quality improvements (Planned for post-launch)
✅ **Real-Time Engagement** – Live, interactive gallery
✅ **Social Sharing** – Easy sharing on social media
✅ **Temporary Hosting** – Limited-time access to event memories
✅ **Multiple Gallery Views** – Grid, masonry, and slideshow options
✅ **Custom Event URLs** – Branded sharing links
✅ **Tag-Based Organization** – Intuitive content discovery

---

## 🚀 Technical Implementation

### 🔒 Security Measures
- ✅ JWT-based authentication
- ✅ Rate limiting on uploads
- ✅ Secure file handling
- ✅ CSRF protection
- ✅ Row Level Security policies
- ✅ Permission-based access controls
- ✅ Role-based middleware

### 🎨 UI/UX Considerations
- ✅ Mobile-first design
- 🟡 Offline capabilities (70% complete)
- ✅ Progressive loading
- ✅ Touch-optimized interfaces
- ✅ Responsive layouts
- ✅ Accessibility compliance
- ✅ Dark mode support

### ⚡ Performance Optimizations
- ✅ Image lazy loading
- ✅ Progressive image loading
- ✅ Client-side caching
- ✅ Optimized asset delivery
- ✅ Bundle size optimization
- ✅ Code splitting
- 🟡 Advanced caching strategies (50% complete)

---

## 🔄 Implementation Progress

As we approach our April 1, 2025 launch date, the invited guest flow is approximately 80% complete. Recent implementations include:

### Key Achievements:
- ✅ Custom event URLs for better branding and sharing
- ✅ Multiple gallery layouts (grid, masonry, slideshow)
- ✅ Tag-based filtering for better content organization
- ✅ Enhanced security with role-based access control
- ✅ Improved mobile responsiveness

### Current Focus:
- 🟡 Finalizing QR code-based authentication (80% complete)
- 🟡 Completing download functionality (60% complete)
- 🟡 Enhancing mobile experience (70% complete)
- 🟡 Implementing social authentication (70% complete)

### Next Steps:
1. Complete download functionality for gallery images
2. Finalize QR code-based authentication process
3. Enhance mobile responsiveness for complex components
4. Implement social authentication options

---

## 🎯 Conclusion  

The **Cloud Burst Invited Guest Flow** ensures an **engaging, seamless** photo-sharing experience. By combining **instant access, multiple gallery layouts, and interactive social features**, Cloud Burst redefines how guests **capture and relive their event memories**. With the implementation of custom event URLs and tag-based filtering, the platform now offers a more intuitive and branded experience for event attendees.

---
