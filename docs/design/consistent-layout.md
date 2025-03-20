# Consistent Layout Guidelines

## Overview

This document outlines the standard layout approach for all protected pages in the Cloud Burst application. Following these guidelines ensures visual consistency across the application and prevents layout issues on all devices, including mobile.

## IMPORTANT: Direct Style Control Approach

After extensive testing, we've determined that **direct inline styles** provide the most reliable layout control across all devices. This approach has successfully resolved layout issues that persisted with class-based styling.

```jsx
// ✅ RECOMMENDED APPROACH - Direct style control
<div style={{ width: '100%', padding: '24px' }}>
  {/* Content */}
</div>

// ❌ AVOID - Class-based approach with potential nesting issues
<div className="w-full p-6">
  {/* Content */}
</div>
```

## Layout Structure

All protected pages that are accessible from the sidebar menu should follow this consistent layout structure:

```jsx
<div style={{ 
  width: '100%', 
  padding: '24px',
  minHeight: '100vh',
  backgroundColor: 'var(--background)'
}}>
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ 
      fontSize: '24px', 
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
    gap: '24px',
    width: '100%',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
  }}>
    {/* Content cards */}
  </div>
</div>
```

## Key Layout Guidelines

1. **Outer Container**
   - Always use `width: '100%'` to ensure the page content fills the available space
   - Always use consistent padding of `padding: '24px'` on all sides
   - Include `minHeight: '100vh'` to ensure the container expands to fill the viewport
   - Use `backgroundColor: 'var(--background)'` for consistent theming

2. **Page Header**
   - Wrapper div with `marginBottom: '24px'`
   - Page title with `fontSize: '24px'`, `fontWeight: 'bold'`, and `marginBottom: '8px'`
   - Page description with `color: 'var(--muted-foreground)'`

3. **Content Spacing**
   - Use consistent spacing between page elements (sections, cards, etc.)
   - Top-level content sections should have `marginBottom: '24px'` or more for clear separation

4. **Grid Layouts**
   - Use this consistent grid pattern: `display: 'grid', gap: '24px', width: '100%', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'`
   - For custom breakpoints, use media queries in the component or conditional styling based on viewport width

5. **Forms and Actions**
   - Place action buttons consistently (usually top-right or bottom-right)
   - Maintain consistent spacing around form elements
   - Use `width: '100%'` on form containers to ensure proper spacing

## Mobile-Specific Considerations

1. **Viewport Detection**
   ```jsx
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
   <div style={{ 
     display: 'grid',
     gap: '16px',
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
   - Increase spacing between interactive elements on mobile
   - Use explicit button and input sizes rather than relying on text size for dimensions

4. **Mobile-First Styling**
   ```jsx
   // Define base styles for mobile first
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

## Benefits of This Approach

- **Visual Consistency**: Users experience the same layout patterns across all pages
- **Maintainability**: Using inline styles for base layout ensures styles are explicitly defined
- **Predictability**: Developers can easily understand how to structure new pages
- **Responsiveness**: The layout adjusts naturally to different screen sizes
- **Debugging**: Layout issues are easier to diagnose when styles are explicitly defined

## Troubleshooting Common Layout Issues

1. **Content not filling available width**
   - Ensure the outer container has `width: '100%'`
   - Avoid nested containers with fixed or percentage widths that compete with each other

2. **Inconsistent padding**
   - Always use `padding: '24px'` on the outer container
   - Avoid additional padding on immediate children that would create uneven spacing

3. **Misaligned headers or content**
   - Follow the title and description structure exactly
   - Use the provided font sizes and spacing values

4. **Layout issues on mobile**
   - Implement viewport detection as shown above
   - Always test your implementation on multiple device sizes
   - Use the direct style approach rather than relying on utility classes

## Examples

The following pages implement this consistent layout successfully:

- Dashboard (with responsive stats cards)
- Events Management (with enhanced card layout)
- Overview (with responsive chart)
- Templates
- QR Codes
- All Media
- Manage Invitations

## Implementation Notes

To update a page to use the consistent layout:
1. Replace class-based styles with the inline style approach from this guide
2. Implement the viewport detection code to handle mobile views
3. Apply conditional styling based on the `isMobile` state
4. Test the implementation across multiple device sizes

This direct style control provides more consistent results across the application and is the officially recommended approach for all protected pages. 