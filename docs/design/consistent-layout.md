# Consistent Layout Guidelines

## Overview

This document outlines the standard layout approach for all protected pages in the Cloud Burst application. Following these guidelines ensures visual consistency across the application and prevents layout issues.

## Layout Structure

All protected pages that are accessible from the sidebar menu should follow this consistent layout structure:

```jsx
<div style={{ width: '100%', padding: '24px' }}>
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Page Title</h1>
    <p style={{ color: 'var(--muted-foreground)' }}>
      Page description or subtitle
    </p>
  </div>
  
  {/* Page content goes here */}
</div>
```

## Key Layout Guidelines

1. **Outer Container**
   - Always use `width: '100%'` to ensure the page content fills the available space
   - Always use consistent padding of `padding: '24px'` on all sides

2. **Page Header**
   - Wrapper div with `marginBottom: '24px'`
   - Page title with `fontSize: '24px'`, `fontWeight: 'bold'`, and `marginBottom: '8px'`
   - Page description with `color: 'var(--muted-foreground)'`

3. **Content Spacing**
   - Use consistent spacing between page elements (sections, cards, etc.)
   - Top-level content sections should have `marginBottom: '24px'` or more for clear separation

4. **Grid Layouts**
   - Use this consistent grid pattern: `display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'`

5. **Forms and Actions**
   - Place action buttons consistently (usually top-right or bottom-right)
   - Maintain consistent spacing around form elements

## Benefits of This Approach

- **Visual Consistency**: Users experience the same layout patterns across all pages
- **Maintainability**: Using inline styles for base layout ensures styles are explicitly defined
- **Predictability**: Developers can easily understand how to structure new pages
- **Responsiveness**: The layout adjusts naturally to different screen sizes

## Troubleshooting Common Layout Issues

1. **Content not filling available width**
   - Ensure the outer container has `width: '100%'`
   - Check that there are no conflicting width constraints in parent elements

2. **Inconsistent padding**
   - Always use `padding: '24px'` on the outer container
   - Avoid additional padding on immediate children that would create uneven spacing

3. **Misaligned headers or content**
   - Follow the title and description structure exactly
   - Use the provided font sizes and spacing values

## Examples

The following pages implement this consistent layout:

- Dashboard
- Overview
- Manage Events
- Templates
- QR Codes
- All Media
- Manage Invitations

## Implementation Notes

To update a page to use the consistent layout, replace class-based styles with the inline style approach from this guide. This direct style control provides more consistent results across the application. 