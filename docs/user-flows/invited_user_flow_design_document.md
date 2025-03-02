# 🎟️ **Invited Guest - User Flow Design Document**  

## Cloud Burst  
📅 *Updated: March 1, 2025*  

## 📌 Situational Abstract
With the implementation of enhanced authentication and role-based access control, Cloud Burst's invited guest flow has been refined to provide a secure yet seamless experience. The platform now features improved state management and data fetching while maintaining our streamlined beta approach.

## 🔍 Introduction  
Cloud Burst is an **event photography platform** that enables guests to Burst, upload, and share photos at **live events** such as weddings, parties, and corporate gatherings.  

📸 *This document details the guest user flow, authentication options, and the event gallery's temporary nature.*  

---

## 🔒 **Security Implementation** [Enhanced]

### 🛡️ **Protected Routes**
- ✅ Rate limiting on all routes
- ✅ Role-based middleware
- ✅ Enhanced session management
- ✅ Secure cookie handling
- ✅ Comprehensive error boundaries

### 🔐 **Guest Authentication** [Beta Focus]
- ✅ Secure session handling
- ✅ Protected route system
- ✅ Rate limited endpoints
- ✅ Cookie security
- 🟡 Social authentication [Post-Beta]

### ⚙️ **User Settings**
- Profile customization
- Theme preferences
- Language selection
- Notification management
- Display options

## 👤 Guest User Journey  

### 📩 **Step 1: Invitation & QR Code Distribution**  
✔️ Guests receive an **email or physical invitation** containing a unique **QR code**
- Uses `<AspectRatio>` for QR code display
- `<Card>` component for email template
- `<Button>` for direct gallery access

### 🎉 **Step 2: Arrival & QR Code Scan**  
✔️ Guests scan the **QR code** using their smartphone camera
- `<Dialog>` for camera access permission
- `<Toast>` for scan confirmation
- `<Progress>` for loading states

### 🔑 **Step 3: Authentication & Settings**  
✔️ **Guest Mode** – Instant access, no sign-up required
✔️ **Social Sign-In** – Login via Google, Apple, or Facebook
✔️ **Profile Setup** – Optional profile customization
- `<Tabs>` for auth options
- `<Form>` with validation for guest info
- `<Button>` variants for social login
- `<Alert>` for authentication status
- `<PreferencesForm>` for settings
- `<NotificationsForm>` for alerts

### 📷 **Step 4: Photo Capture & Upload**  
✔️ **Capture & Upload** button opens the camera/file picker
✔️ **AI-enhanced processing** automatically improves image quality
- `<DropZone>` for file uploads
- `<Progress>` for upload status
- `<Carousel>` for image preview
- `<Skeleton>` for loading states
- `<Toast>` for processing notifications

### 🖼️ **Step 5: Live Photo Gallery**  
✔️ A **real-time photo wall** updates as guests upload images
✔️ **Interactive features** – Like, share, and (optionally) comment
✔️ **AI-generated filters** allow guests to search by theme or faces
- `<ScrollArea>` for gallery view
- `<AspectRatio>` for consistent image display
- `<HoverCard>` for image details
- `<Dialog>` for full-screen view
- `<Select>` for filter options

### ⏳ **Step 6: Post-Event Access**  
✔️ Event photos remain available **for a limited time (1-4 weeks)**
✔️ **Guests receive a follow-up email** with the gallery link
- `<Calendar>` for expiry countdown
- `<Alert>` for access expiration notices
- `<Button>` for download options

---

## 🎨 Page Layouts & Components  

### 🏠 **Welcome Page**  
✔️ Event branding & high-quality visuals
✔️ CTA buttons: *Join as Guest* or *Sign In*
- `<NavigationMenu>` for main navigation
- `<Sheet>` for mobile menu
- `<AspectRatio>` for hero images
- `<Card>` for feature highlights

### 📷 **Photo Capture & Upload Page**  
✔️ Simple **camera & file upload interface**
✔️ AI-enhanced processing for **best image quality**
- `<Tabs>` for capture/upload options
- `<DropZone>` for file handling
- `<Slider>` for image adjustments
- `<Progress>` for processing status

### 🏆 **Live Gallery (Photo Wall)**  
✔️ **Dynamic grid layout** with uploaded images
✔️ **Like, share, and comment** functionality
- `<ScrollArea>` for infinite scroll
- `<AspectRatio>` for image containers
- `<Dialog>` for image modals
- `<Popover>` for sharing options
- `<Form>` for comments

### 📨 **Post-Event Page**  
✔️ **Reminder & persistent gallery link**
✔️ **Download & sharing options** for guests
- `<Card>` for download options
- `<Button>` for actions
- `<Alert>` for expiry notices

### ⚙️ **Settings Page**
✔️ Profile management & customization
✔️ Theme & language preferences
✔️ Notification settings
- `<Tabs>` for settings navigation
- `<Form>` for preferences
- `<Select>` for options
- `<Switch>` for toggles
- `<Toast>` for updates

---

## 🎯 User Benefits  

✔️ **Frictionless Access** – No app installation needed
✔️ **AI-Enhanced Images** – Automatic quality improvements
✔️ **Real-Time Engagement** – Live, interactive gallery
✔️ **Social Sharing** – Easy sharing on social media
✔️ **Temporary Hosting** – Limited-time access to event memories

---

## 🚀 Technical Implementation

### 🔒 Security Measures
- JWT-based authentication
- Rate limiting on uploads
- Secure file handling
- CSRF protection

### 🎨 UI/UX Considerations
- Mobile-first design
- Offline capabilities
- Progressive loading
- Touch-optimized interfaces

### ⚡ Performance Optimizations
- Image lazy loading
- Progressive image loading
- Client-side caching
- Optimized asset delivery

---

## 🎯 Conclusion  

The **Cloud Burst Invited Guest Flow** ensures an **engaging, seamless** photo-sharing experience. By combining **instant access, AI-powered enhancements, and interactive social features**, Cloud Burst redefines how guests **capture and relive their event memories**.  

---
