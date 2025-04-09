# Consistent Layout Guidelines

## Overview

This document outlines the standard layout approach for all protected pages in the Cloud Burst application. Following these guidelines ensures visual consistency across the application and prevents layout issues on all devices, including mobile.

## IMPORTANT: Direct Style Control Approach

After extensive testing and implementation across multiple components, we've confirmed that **direct inline styles with explicit viewport detection** is the definitive layout solution for Cloud Burst. This approach has successfully resolved layout issues that persisted with class-based styling, particularly in complex components like our invitation system, guest management, and camera integration.

```jsx
// ✅ RECOMMENDED APPROACH - Direct style control with viewport detection
import { useState, useEffect } from 'react';

function Component() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '24px'
    }}>
      {/* Content */}
    </div>
  );
}

// ❌ AVOID - Class-based approach with potential nesting issues
<div className="w-full p-6">
  {/* Content */}
</div>
```

## Layout Structure

All protected pages that are accessible from the sidebar menu should follow this consistent layout structure:

```jsx
// Standard page container
<div style={{ 
  width: '100%', 
  padding: '24px',
  minHeight: '100vh',
  backgroundColor: 'var(--background)'
}}>
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ 
      fontSize: isMobile ? '20px' : '24px', 
      fontWeight: 'bold', 
      marginBottom: '8px' 
    }}>Page Title</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>
      Page description or subtitle
    </p>
  </div>
  
  {/* Page content goes here */}
  <div style={{ 
    display: 'grid',
    gap: isMobile ? '16px' : '24px',
    width: '100%',
    gridTemplateColumns: isMobile 
      ? '1fr' 
      : 'repeat(auto-fill, minmax(300px, 1fr))'
  }}>
    {/* Content cards */}
  </div>
</div>
```

## Key Layout Guidelines

1. **Outer Container**
   - Always use `width: '100%'` to ensure the page content fills the available space
   - Use conditional padding based on viewport: `padding: isMobile ? '16px' : '24px'`
   - Include `minHeight: '100vh'` to ensure the container expands to fill the viewport
   - Use `backgroundColor: 'var(--background)'` for consistent theming

2. **Page Header**
   - Wrapper div with `marginBottom: '24px'`
   - Page title with responsive font size: `fontSize: isMobile ? '20px' : '24px'`
   - Page description with `color: 'var(--muted-foreground)'`

3. **Content Spacing**
   - Use consistent, responsive spacing: `gap: isMobile ? '16px' : '24px'`
   - Top-level content sections should have responsive margins

4. **Grid Layouts**
   - Use this responsive grid pattern:
     ```js
     {
       display: 'grid', 
       gap: isMobile ? '16px' : '24px', 
       width: '100%', 
       gridTemplateColumns: isMobile 
         ? '1fr' 
         : 'repeat(auto-fill, minmax(300px, 1fr))'
     }
     ```

5. **Forms and Actions**
   - Place action buttons consistently (usually top-right or bottom-right)
   - Use responsive button sizing: `height: isMobile ? '48px' : '40px'`
   - Use `width: '100%'` on form containers to ensure proper spacing
   - Implement consistent error state visualization with clear visual indicators
   - Use Zod for form validation with consistent error message styling

6. **Error States**
   - Use consistent error styling with `color: var(--destructive)` for error messages
   - Provide clear visual indicators for form field errors
   - Position error messages where they're clearly visible without scrolling on mobile
   - Implement touch-friendly error recovery actions
   - Ensure error states are distinguishable on small screens

## Mobile-Specific Considerations

1. **Viewport Detection**
   ```jsx
   // Standard viewport detection - use this in all responsive components
   const [isMobile, setIsMobile] = useState(false);
   
   useEffect(() => {
     const checkScreenSize = () => {
       setIsMobile(window.innerWidth < 768);
     };
     
     checkScreenSize();
     window.addEventListener('resize', checkScreenSize);
     return () => window.removeEventListener('resize', checkScreenSize);
   }, []);
   ```

2. **Conditional Layouts**
   ```jsx
   // Responsive grid with conditional columns
   <div style={{ 
     display: 'grid',
     gap: isMobile ? '16px' : '24px',
     width: '100%',
     gridTemplateColumns: isMobile 
       ? '1fr' 
       : 'repeat(auto-fill, minmax(300px, 1fr))'
   }}>
     {/* Cards */}
   </div>
   ```

3. **Touch-Friendly Sizing**
   - All interactive elements should have a minimum touch target size of 44px × 44px
   - Increase spacing between interactive elements on mobile to at least 16px
   - Use explicit button sizes: `height: isMobile ? '48px' : '40px'`
   - Ensure sufficient tap targets for all interactive elements

4. **Mobile-First Styling**
   ```jsx
   // Define base styles for mobile first, then enhance for desktop
   const containerStyle = {
     display: 'flex',
     flexDirection: 'column',
     gap: '16px',
     width: '100%'
   };
   
   // Conditionally adjust for larger screens
   if (!isMobile) {
     containerStyle.flexDirection = 'row';
     containerStyle.gap = '24px';
   }
   
   return (
     <div style={containerStyle}>
       {/* Content */}
     </div>
   );
   ```

5. **Error Handling on Mobile**
   - Position error messages where they're clearly visible without scrolling
   - Use concise error messages that work on smaller screens
   - Implement touch-friendly error recovery actions
   - Ensure error states are distinguishable on small screens

6. **Loading States**
   - Implement consistent loading indicators optimized for mobile
   - Use appropriate sizing for loading indicators: `size={isMobile ? 36 : 48}`
   - Provide feedback for long-running operations
   - Consider skeleton loaders for content-heavy pages

   ```jsx
   {isLoading ? (
     <div style={{
       width: '100%',
       padding: isMobile ? '16px' : '24px',
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       minHeight: isMobile ? '200px' : '300px'
     }}>
       <div style={{
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         gap: '16px'
       }}>
         <Spinner size={isMobile ? 36 : 48} />
         <p style={{ color: 'var(--muted-foreground)' }}>
           Loading content...
         </p>
       </div>
     </div>
   ) : (
     // Actual content
   )}
   ```

## Recent Improvements

Based on recent implementation and troubleshooting work, we've made the following enhancements to our mobile approach:

1. **Camera Components**
   - Implemented responsive camera interfaces with adaptive controls
   - Created touch-optimized capture buttons (60px diameter on mobile)
   - Added device-specific optimizations for different camera types
   - Implemented media capture with responsive preview rendering

2. **Guest Registration System**
   - Optimized registration forms for mobile with touch-friendly inputs
   - Implemented responsive magic link authentication flows
   - Created mobile-friendly gallery access experiences
   - Ensured error states are clearly visible on small screens

3. **Gallery Improvements**
   - Optimized gallery grid for mobile with single-column layouts
   - Implemented touch-friendly photo interactions
   - Added responsive media controls for various viewport sizes
   - Created mobile-optimized permission interfaces

4. **Performance Optimizations**
   - Reduced layout shifts on mobile through consistent container sizing
   - Implemented responsive image sizing based on viewport
   - Optimized touch interactions with appropriate hit targets
   - Added viewport-specific code splitting for mobile experiences

5. **Unified Methodology**
   - Standardized the viewport detection pattern across all components
   - Established consistent responsive spacing values
   - Created a unified approach to conditional rendering based on viewport
   - Documented best practices for mobile-specific optimizations

## Benefits of This Approach

- **Visual Consistency**: Users experience the same layout patterns across all pages
- **Maintainability**: Using direct styles ensures explicit style definitions
- **Predictability**: Developers can easily understand how pages should respond
- **Responsiveness**: The layout reliably adjusts to different screen sizes
- **Debugging**: Layout issues are easier to diagnose when styles are explicitly defined
- **Performance**: Reduced CSS overhead and more predictable rendering
- **Touch Optimization**: Properly sized interactive elements on mobile

## Troubleshooting Common Layout Issues

1. **Content not filling available width**
   - Ensure the outer container has `width: '100%'`
   - Avoid nested containers with fixed or percentage widths that compete

2. **Inconsistent spacing**
   - Use conditional spacing based on viewport: `gap: isMobile ? '16px' : '24px'`
   - Apply consistent spacing patterns throughout the component

3. **Misaligned headers or content**
   - Follow the title and description structure exactly
   - Use responsive font sizes and spacing values

4. **Layout issues on mobile**
   - Implement the standard viewport detection code in every component
   - Always test implementations on multiple device sizes
   - Use the direct style approach with conditional values based on viewport

5. **Poor error state visibility**
   - Ensure error messages are clearly visible on mobile without scrolling
   - Use consistent error styling with appropriate color contrast
   - Make error recovery actions touch-friendly

6. **Inconsistent loading states**
   - Use the standard loading pattern for all asynchronous operations
   - Ensure loading indicators are properly sized for both desktop and mobile
   - Provide helpful loading messages for longer operations

## Examples

The following pages implement this consistent layout successfully:

- Dashboard (with responsive stats cards)
- Events Management (with enhanced card layout)
- Overview (with responsive chart)
- Templates
- QR Codes
- All Media
- Manage Invitations
- Invitation System (with SendGrid integration)
- Email Delivery Tracking
- Guest Reservation System
- Camera Integration
- Gallery Permission Management

## Implementation Notes

To update a page to use the consistent layout:
1. Replace class-based styles with the direct style approach
2. Implement the standard viewport detection code
3. Apply conditional styling based on the `isMobile` state
4. Test the implementation across multiple device sizes
5. Ensure proper error state visualization on mobile
6. Implement appropriate loading states
7. Include touch-optimized interactive elements:
   ```jsx
   <button style={{ 
     height: isMobile ? '48px' : '40px',
     minWidth: isMobile ? '100px' : '80px',
     padding: '0 16px',
     borderRadius: '8px',
     fontSize: isMobile ? '16px' : '14px',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     gap: '8px'
   }}>
     <Icon size={isMobile ? 20 : 16} />
     <span>Action</span>
   </button>
   ```

See also:
- `docs/design/layout-troubleshooting.md` for debugging layout issues
- `docs/design/UI_components.md` for component-specific implementation details
- `docs/design/style.md` for general styling guidelines

This direct style control provides more consistent results across the application and is the officially recommended approach for all protected pages. 