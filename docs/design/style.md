# 📝 Style Guide

## Cloud Burst Design System
📅 *Updated: April 9, 2025*
📊 *Version: 0.8.9*

## 📌 Situational Abstract

The Cloud Burst design system has matured significantly as we approach our April 15, 2025 launch date. Following extensive implementation and testing across multiple components, we've established a comprehensive set of design standards, code conventions, and documentation practices that guide our development process.

Our design system now provides clear guidelines for colors, typography, spacing, and component styling, creating a unified visual language that enhances user experience. Recent implementations of the guest reservation system, camera integration, and gallery permission controls have reinforced our commitment to the direct style approach with explicit viewport detection, which has proven to be the most reliable method for ensuring consistent layouts across all devices.

The design system is now approximately 95% complete, with all major components implemented and mobile-optimized. Our focus on responsive design has ensured that components work seamlessly across devices, with special attention given to touch optimization for mobile interfaces. The system effectively balances aesthetic considerations with technical implementation needs, ensuring consistent user experiences across all platform features.

## 🎨 Design Standards
1. **Colors**
   ```typescript
   primary: "hsl(var(--primary))"
   secondary: "hsl(var(--secondary))"
   accent: "hsl(var(--accent))"
   background: "hsl(var(--background))"
   foreground: "hsl(var(--foreground))"
   muted: "hsl(var(--muted))"
   muted-foreground: "hsl(var(--muted-foreground))"
   card: "hsl(var(--card))"
   card-foreground: "hsl(var(--card-foreground))"
   border: "hsl(var(--border))"
   input: "hsl(var(--input))"
   ring: "hsl(var(--ring))"
   destructive: "hsl(var(--destructive))"
   destructive-foreground: "hsl(var(--destructive-foreground))"
   success: "hsl(var(--success))"
   success-foreground: "hsl(var(--success-foreground))"
   warning: "hsl(var(--warning))"
   warning-foreground: "hsl(var(--warning-foreground))"
   info: "hsl(var(--info))"
   info-foreground: "hsl(var(--info-foreground))"
   ```

2. **Typography**
   ```typescript
   fontSans: "'Inter', sans-serif"
   fontMono: "'Fira Code', monospace"
   fontHeading: "'Inter', sans-serif"
   
   // Font weights
   fontWeight: {
     light: 300,
     normal: 400,
     medium: 500,
     semibold: 600,
     bold: 700,
   }
   
   // Line heights
   lineHeight: {
     tight: 1.2,
     normal: 1.5,
     relaxed: 1.75,
   }

   // Font sizes
   fontSize: {
     xs: ['0.75rem', { lineHeight: '1rem' }],
     sm: ['0.875rem', { lineHeight: '1.25rem' }],
     base: ['1rem', { lineHeight: '1.5rem' }],
     lg: ['1.125rem', { lineHeight: '1.75rem' }],
     xl: ['1.25rem', { lineHeight: '1.75rem' }],
     '2xl': ['1.5rem', { lineHeight: '2rem' }],
     '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
     '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
     '5xl': ['3rem', { lineHeight: '1' }],
     '6xl': ['3.75rem', { lineHeight: '1' }],
   }
   ```

3. **Spacing**
   ```typescript
   space: {
     px: "1px",
     0.5: "0.125rem",
     1: "0.25rem",
     1.5: "0.375rem",
     2: "0.5rem",
     2.5: "0.625rem",
     3: "0.75rem",
     3.5: "0.875rem",
     4: "1rem",
     5: "1.25rem",
     6: "1.5rem",
     7: "1.75rem",
     8: "2rem",
     9: "2.25rem",
     10: "2.5rem",
     11: "2.75rem",
     12: "3rem",
     14: "3.5rem",
     16: "4rem",
     20: "5rem",
     24: "6rem",
     28: "7rem",
     32: "8rem",
     36: "9rem",
     40: "10rem",
     44: "11rem",
     48: "12rem",
     52: "13rem",
     56: "14rem",
     60: "15rem",
     64: "16rem",
     72: "18rem",
     80: "20rem",
     96: "24rem",
   }
   ```

4. **Shadows**
   ```typescript
   shadows: {
     sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
     DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
     md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
     lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
     xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
     "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
     inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
     none: "none",
   }
   ```

5. **Border Radius**
   ```typescript
   borderRadius: {
     none: "0",
     sm: "0.125rem",
     DEFAULT: "0.25rem",
     md: "0.375rem",
     lg: "0.5rem",
     xl: "0.75rem",
     "2xl": "1rem",
     "3xl": "1.5rem",
     full: "9999px",
   }
   ```

6. **Animation**
   ```typescript
   animation: {
     none: 'none',
     spin: 'spin 1s linear infinite',
     ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
     pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
     bounce: 'bounce 1s infinite',
     fadeIn: 'fadeIn 0.3s ease-in-out',
     slideIn: 'slideIn 0.3s ease-in-out',
     expandIn: 'expandIn 0.2s ease-out',
   }
   ```

## 💻 Code Style
1. **TypeScript**
   - ✅ Strict mode enabled
   - ✅ Interface over type when appropriate
   - ✅ Explicit return types for functions
   - ✅ Proper error handling with typed errors
   - ✅ Comprehensive comments using TSDoc format
   - ✅ Consistent naming conventions
   - ✅ Proper use of generics
   - ✅ Null checking and undefined handling
   - ✅ Zod schemas for runtime validation
   - ✅ Type-safe event handling
   - ✅ Strong typing for API responses

2. **React**
   - ✅ Functional components with proper typing
   - ✅ Custom hooks for reusable logic
   - ✅ Proper prop types with defaults
   - ✅ Error boundaries for component isolation
   - ✅ Performance optimization (memoization, etc.)
   - ✅ Controlled components for forms
   - ✅ Proper key usage in lists
   - ✅ Context API for state sharing
   - ✅ React Hook Form for form management
   - ✅ Server components where appropriate
   - ✅ Role-based component rendering

3. **CSS/Tailwind**
   - ✅ Utility-first approach with Tailwind
   - ✅ Component classes for reusable patterns
   - ✅ Responsive design with mobile-first approach
   - ✅ Dark mode support with proper contrast
   - ✅ Accessibility classes for focus states
   - ✅ Consistent spacing using theme values
   - ✅ Animation and transition standards
   - ✅ CSS variables for theme values
   - ✅ Group modifiers for interactive states
   - ✅ Container queries for advanced responsiveness
   - ✅ Semantic color usage with variables

4. **File Structure**
   - ✅ Consistent file naming (kebab-case for files)
   - ✅ Logical directory organization
   - ✅ Index files for clean imports
   - ✅ Co-location of related files
   - ✅ Separation of concerns
   - ✅ Feature-based organization
   - ✅ Shared utilities in common locations
   - ✅ Environment-specific configuration
   - ✅ Route group organization in app directory
   - ✅ Component directory structure (ui, layout, features)
   - ✅ Parallel route organization

## 📚 Documentation
1. **Markdown**
   - ✅ Clear headings with hierarchy
   - ✅ Code blocks with language specification
   - ✅ Examples with context
   - ✅ Links to related documentation
   - ✅ Images with descriptive alt text
   - ✅ Tables for structured data
   - ✅ Lists for sequential information
   - ✅ Blockquotes for important notes
   - ✅ Task lists for status tracking
   - ✅ Diagrams using Mermaid
   - ✅ Version metadata and update dates

2. **Comments**
   - ✅ TSDoc format for functions and classes
   - ✅ Clear descriptions of purpose
   - ✅ Parameter documentation with types
   - ✅ Return type documentation
   - ✅ Examples of usage
   - ✅ Edge case notes
   - ✅ Deprecation notices when applicable
   - ✅ Links to related code
   - ✅ Auth/permission requirements
   - ✅ Performance considerations
   - ✅ Security implications

3. **API Documentation**
   - ✅ Endpoint descriptions
   - ✅ Request and response formats
   - ✅ Authentication requirements
   - ✅ Error codes and handling
   - ✅ Rate limiting information
   - ✅ Example requests and responses
   - ✅ Versioning information
   - ✅ Deprecation notices
   - ✅ Permission requirements
   - ✅ Data validation rules
   - ✅ Rate limit documentation

## 📊 Dashboard Design

1. **Dashboard Layout**
   ```typescript
   // Main layout structure with mobile detection
   function DashboardLayout({ children }) {
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
         display: 'flex',
         flexDirection: isMobile ? 'column' : 'row',
         minHeight: '100vh'
       }}>
         <SideNav collapsed={isMobile} />
         <main style={{
           flex: 1,
           padding: isMobile ? '16px' : '24px',
           overflowY: 'auto'
         }}>
           <DashboardHeader />
           <div style={{
             display: 'grid',
             gap: isMobile ? '16px' : '24px',
             marginTop: isMobile ? '16px' : '24px'
           }}>
             {children}
           </div>
         </main>
       </div>
     );
   }
   ```

2. **Dashboard Components**
   ```typescript
   // Component styling with mobile detection
   function DashboardCard({ title, children }) {
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
         padding: isMobile ? '16px' : '24px',
         borderRadius: '8px',
         boxShadow: 'var(--shadow-md)',
         backgroundColor: 'var(--card)',
         width: '100%'
       }}>
         <div style={{
           marginBottom: isMobile ? '12px' : '16px'
         }}>
           <h3 style={{
             fontSize: isMobile ? '16px' : '18px',
             fontWeight: 'bold'
           }}>
             {title}
           </h3>
         </div>
         <div>
           {children}
         </div>
       </div>
     );
   }
   ```

3. **Dashboard Grid**
   ```typescript
   // Main grid layout with mobile detection
   function DashboardGrid({ children }) {
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
         display: 'grid',
         gridTemplateColumns: isMobile
           ? '1fr'
           : 'repeat(auto-fill, minmax(300px, 1fr))',
         gap: isMobile ? '16px' : '24px',
         width: '100%'
       }}>
         {children}
       </div>
     );
   }
   ```

4. **Dashboard Statistics**
   ```typescript
   // Stats card styling with mobile detection
   function StatsCard({ title, value, icon }) {
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
         padding: isMobile ? '16px' : '20px',
         backgroundColor: 'var(--primary/5)',
         borderRadius: '8px',
         width: '100%'
       }}>
         <div style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between'
         }}>
           <div>
             <p style={{
               fontSize: isMobile ? '12px' : '14px',
               fontWeight: 'medium',
               color: 'var(--muted-foreground)'
             }}>
               {title}
             </p>
             <h3 style={{
               fontSize: isMobile ? '20px' : '24px',
               fontWeight: 'bold'
             }}>
               {value}
             </h3>
           </div>
           <div style={{
             padding: isMobile ? '8px' : '12px',
             backgroundColor: 'var(--primary/10)',
             borderRadius: '9999px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             {icon}
           </div>
         </div>
       </div>
     );
   }
   ```

## 📧 Email Template Styling
1. **HTML Email Standards**
   ```html
   <!-- Table-based layout -->
   <table cellpadding="0" cellspacing="0" border="0" width="100%">
     <tr>
       <td style="padding: 20px; font-family: sans-serif;">
         Content
       </td>
     </tr>
   </table>
   ```

2. **Email Typography**
   ```css
   /* Web-safe fonts */
   font-family: Arial, Helvetica, sans-serif;
   font-size: 16px;
   line-height: 1.5;
   color: #333333;
   ```

3. **Email Colors**
   ```css
   /* Brand colors */
   color: #3b82f6; /* primary */
   background-color: #ffffff; /* background */
   border-color: #e5e7eb; /* border */
   ```

4. **Responsive Email**
   ```css
   /* Mobile-first approach */
   @media screen and (max-width: 600px) {
     .email-container {
       width: 100% !important;
     }
     .email-content {
       padding: 10px !important;
     }
     .email-button {
       width: 100% !important;
       text-align: center !important;
     }
   }
   ```

5. **Email Accessibility**
   - ✅ Alt text for all images
   - ✅ Semantic HTML structure
   - ✅ Sufficient color contrast (4.5:1 minimum)
   - ✅ Text alternatives for buttons
   - ✅ Clear hierarchy with headings
   - ✅ Descriptive link text
   - ✅ Proper table structure with headers
   - ✅ Language attribute on HTML tag

## 🖼️ Image Standards

1. **Formats and Optimization**
   - ✅ JPEG for photographs (.jpg)
   - ✅ PNG for graphics with transparency (.png)
   - ✅ SVG for icons and simple graphics (.svg)
   - ✅ WebP for modern browsers with fallbacks (.webp)
   - ✅ Proper compression for web delivery
   - ✅ Responsive image srcsets
   - ✅ Lazy loading implementation
   - ✅ Appropriate dimensions for context
   - ✅ Next.js Image component usage
   - ✅ Blur placeholders for large images
   - ✅ Quality optimization strategies

2. **Naming Conventions**
   ```
   [component]-[variant]-[size].[format]
   example: button-primary-lg.svg
   ```

3. **Asset Organization**
   ```
   /public
     /images
       /ui
         /icons
         /logos
         /backgrounds
       /content
         /events
         /profiles
         /marketing
   ```

## 📱 Responsive Design

### Official Responsive Implementation

> **DEFINITIVE SOLUTION:** After extensive implementation and testing, **direct inline styles with explicit viewport detection** is the official required approach for all layout containers in Cloud Burst.

```tsx
// Official responsive implementation pattern - REQUIRED for all layout components
import { useState, useEffect } from 'react';

export default function Component() {
  // Mobile detection - REQUIRED for all responsive components
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
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: 'bold',
        marginBottom: isMobile ? '12px' : '16px'
      }}>
        Component Title
      </h2>
      
      {/* Content with conditional layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        width: '100%'
      }}>
        {/* Cards or items */}
      </div>
    </div>
  );
}
```

This approach has successfully resolved layout issues across all device sizes and MUST be used for all layout containers in protected pages. For UI components that don't control layout (buttons, inputs, etc.), Tailwind classes can still be used.

### Key Benefits of Direct Style Approach:
- **Explicit Control**: Layout styles are directly visible in the component
- **Simplified Debugging**: Easier to diagnose and fix layout issues
- **Consistent Behavior**: Reliable rendering across devices and browsers
- **Clearer Intention**: Developer intent is explicitly stated
- **Reduced Conflicts**: No competing utility classes or CSS specificity issues
- **Viewport Awareness**: Built-in mobile detection for responsive adjustments
- **Touch Optimization**: Proper sizing for interactive elements on mobile
- **Consistent Spacing**: Standardized responsive gap values

See `docs/design/consistent-layout.md` and `docs/design/layout-troubleshooting.md` for complete implementation details.

### Responsive Implementation Requirements

All components that include layout or require responsive behavior **MUST**:

1. **Implement the standard viewport detection** with the `isMobile` state
2. **Use direct inline styles** for all layout containers
3. **Apply conditional styles** based on the `isMobile` state
4. **Set `width: '100%'`** on all container elements
5. **Use responsive spacing values**: `gap: isMobile ? '16px' : '24px'`
6. **Apply touch-friendly sizing** on mobile: `height: isMobile ? '48px' : '40px'`
7. **Test thoroughly** on multiple device sizes

### Mobile-Specific Implementations

Our recent feature implementations have proven the effectiveness of our responsive approach:

#### 1. Camera Capture Component

```tsx
// Camera capture with mobile optimization
function CameraCapture() {
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
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Camera preview */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'black'
      }}>
        <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Mobile-optimized capture button */}
        <button
          onClick={capturePhoto}
          style={{
            position: 'absolute',
            bottom: isMobile ? '20px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '60px' : '50px',  // Larger on mobile
            height: isMobile ? '60px' : '50px', // Larger on mobile
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '3px solid var(--primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CameraIcon size={isMobile ? 28 : 24} />
        </button>
      </div>
      
      {/* Camera controls - responsive layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px'
      }}>
        {/* Controls */}
      </div>
    </div>
  );
}
```

#### 2. Guest Registration Form

```tsx
// Guest registration form with mobile optimization
function GuestRegistrationForm() {
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
      maxWidth: '500px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px',
      backgroundColor: 'var(--card)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-md)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        Register for Gallery Access
      </h2>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px'
          }}
        >
          {/* Form fields */}
          
          {/* Mobile-optimized submit button */}
          <button
            type="submit"
            style={{
              height: isMobile ? '48px' : '40px',
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: 'medium',
              marginTop: '8px'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </Form>
    </div>
  );
}
```

#### 3. Gallery Permission Controls

```tsx
// Gallery permission controls with mobile optimization
function GalleryPermissionControl() {
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
      padding: isMobile ? '12px' : '16px',
      backgroundColor: 'var(--card)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '12px' : '0'
      }}>
        <div>
          <h3 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold'
          }}>
            Gallery Access
          </h3>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: 'var(--muted-foreground)'
          }}>
            Control who can access this gallery
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
          gap: isMobile ? '8px' : '12px'
        }}>
          {/* Permission controls */}
        </div>
      </div>
    </div>
  );
}
```

### Breakpoints

```typescript
// Standard viewport breakpoints
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
```

### Mobile-First Approach

When using inline styles for responsive layouts:

```tsx
// Mobile-first approach with inline styles
const cardContainerStyle = {
  display: 'grid', 
  gridTemplateColumns: '1fr', // Mobile default (single column)
  gap: '16px',
  width: '100%'
};

// Adjust for larger screens
if (!isMobile) {
  cardContainerStyle.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  cardContainerStyle.gap = '24px';
}

// Apply the styles
return (
  <div style={cardContainerStyle}>
    {/* Content */}
  </div>
);
```

### Container Queries

For components that need to respond to their container size rather than viewport:

```tsx
// Container query example with ResizeObserver
import { useState, useEffect, useRef } from 'react';

function ContainerResponsiveComponent() {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  const isNarrow = containerWidth < 400;
  
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ 
        display: isNarrow ? 'flex' : 'grid',
        flexDirection: isNarrow ? 'column' : undefined,
        gridTemplateColumns: isNarrow ? undefined : '1fr 1fr',
        gap: '16px'
      }}>
        {/* Content */}
      </div>
    </div>
  );
}
```

### Touch Targets

```typescript
// Proper touch target sizing (REQUIRED for mobile)
<button style={{
  height: isMobile ? '48px' : '40px', // Larger target on mobile (REQUIRED)
  minWidth: isMobile ? '48px' : '40px',
  padding: isMobile ? '0 16px' : '0 12px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: isMobile ? '16px' : '14px'
}}>
  Button Text
</button>
```

## 🎯 Component Best Practices

1. **Accessibility**
   - ✅ Semantic HTML elements
   - ✅ ARIA attributes when necessary
   - ✅ Keyboard navigation support
   - ✅ Focus management
   - ✅ Screen reader announcements
   - ✅ Color contrast compliance
   - ✅ Reduced motion alternatives
   - ✅ Form labeling and validation
   - ✅ Error identification
   - ✅ Focus visible indicators

2. **Performance**
   - ✅ Code splitting
   - ✅ Tree shaking
   - ✅ Component memoization
   - ✅ Lazy loading
   - ✅ Image optimization
   - ✅ Bundle size monitoring
   - ✅ Virtualization for long lists
   - ✅ Efficient re-renders
   - ✅ Reducing layout shifts
   - ✅ Optimized animations

3. **Role-Based UI**
   - ✅ Permission-based component rendering
   - ✅ Role-specific UI elements
   - ✅ Conditional navigation items
   - ✅ Context-aware actions
   - ✅ Ownership verification
   - ✅ Subscription-based feature access

## 🔄 Recent Mobile Implementation Successes

As we approach our launch date, we've successfully implemented and refined our mobile approach across several key features:

### 1. Camera Integration

Our camera capture component delivers an optimized mobile experience with:
- Touch-optimized capture button (60px diameter on mobile)
- Responsive camera controls that adapt to viewport size
- Simplified UI on mobile with conditional rendering
- Optimized preview rendering for mobile devices
- Clear permission request handling for camera access
- Proper error handling with mobile-friendly messages

### 2. Guest Registration System

The guest registration flow provides a seamless mobile experience with:
- Touch-friendly form inputs with appropriate sizing
- Responsive form layout with increased spacing on mobile
- Clear error messages positioned for mobile visibility
- Simplified navigation for mobile users
- Optimized magic link authentication flow
- Mobile-friendly gallery access experience

### 3. Gallery Permission Controls

Our gallery system delivers consistent mobile functionality with:
- Responsive permission controls that adapt to mobile
- Touch-friendly toggles and buttons
- Clear visual hierarchy on small screens
- Simplified interface on mobile
- Optimized photo grid layouts for mobile devices
- Performance-optimized for mobile networks

### 4. Mobile Dashboard Experience

The dashboard provides a fully responsive experience with:
- Simplified navigation on mobile
- Responsive card layouts that adapt to screen size
- Touch-optimized interactive elements
- Conditional rendering for complex components
- Performance optimizations for mobile devices
- Clear visual hierarchy on small screens

## 🚀 Implementation Status

As we approach our April 15, 2025 launch date, our design system is approximately 95% complete. Recent implementations of the guest reservation system, camera integration, and gallery permission controls have reinforced our commitment to the direct style approach with explicit viewport detection.

### Key Achievements:
- ✅ Established definitive layout solution with direct styles and explicit viewport detection
- ✅ Successfully implemented mobile-optimized camera capture interface
- ✅ Created responsive guest registration system with touch optimization
- ✅ Built comprehensive gallery permission controls that adapt to mobile
- ✅ Standardized responsive spacing and typography across all components
- ✅ Optimized touch targets for all interactive elements on mobile
- ✅ Implemented consistent error handling optimized for mobile

### Final Steps:
1. Complete final testing across all device sizes
2. Optimize remaining components with the direct style approach
3. Audit touch target sizes across all interactive elements
4. Document all mobile-specific implementation details
5. Ensure accessibility compliance on mobile devices
6. Verify performance metrics on mobile networks
7. Create comprehensive documentation for future development 