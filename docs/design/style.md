# 📝 Style Guide

## Cloud Burst Design System
📅 *Updated: March 3, 2025*
📊 *Version: 0.7.0*

## 📌 Situational Abstract

The Cloud Burst design system has matured into a cohesive framework that ensures consistency across our event photography platform. Since the project's inception in February 2025, we've established a comprehensive set of design standards, code conventions, and documentation practices that guide our development process.

Our design system now provides clear guidelines for colors, typography, spacing, and component styling, creating a unified visual language that enhances user experience. The recent implementation of strict TypeScript standards has improved code quality and maintainability, while our documentation practices ensure that all team members have access to up-to-date information about the platform's design and functionality.

As we approach our April 1, 2025 launch date, the design system is approximately 90% complete, with current refinements focused on accessibility enhancements and responsive design optimizations. The system effectively balances aesthetic considerations with performance requirements, ensuring that the platform remains responsive and accessible across devices.

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

2. **React**
   - ✅ Functional components with proper typing
   - ✅ Custom hooks for reusable logic
   - ✅ Proper prop types with defaults
   - ✅ Error boundaries for component isolation
   - ✅ Performance optimization (memoization, etc.)
   - ✅ Controlled components for forms
   - ✅ Proper key usage in lists
   - ✅ Context API for state sharing

3. **CSS/Tailwind**
   - ✅ Utility-first approach with Tailwind
   - ✅ Component classes for reusable patterns
   - ✅ Responsive design with mobile-first approach
   - ✅ Dark mode support with proper contrast
   - ✅ Accessibility classes for focus states
   - ✅ Consistent spacing using theme values
   - ✅ Animation and transition standards
   - ✅ CSS variables for theme customization

4. **File Structure**
   - ✅ Consistent file naming (kebab-case for files)
   - ✅ Logical directory organization
   - ✅ Index files for clean imports
   - ✅ Co-location of related files
   - ✅ Separation of concerns
   - ✅ Feature-based organization
   - ✅ Shared utilities in common locations
   - ✅ Environment-specific configuration

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

2. **Comments**
   - ✅ TSDoc format for functions and classes
   - ✅ Clear descriptions of purpose
   - ✅ Parameter documentation with types
   - ✅ Return type documentation
   - ✅ Examples of usage
   - ✅ Edge case notes
   - ✅ Deprecation notices when applicable
   - ✅ Links to related code

3. **API Documentation**
   - ✅ Endpoint descriptions
   - ✅ Request and response formats
   - ✅ Authentication requirements
   - ✅ Error codes and handling
   - ✅ Rate limiting information
   - ✅ Example requests and responses
   - ✅ Versioning information
   - ✅ Deprecation notices

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

## 🔄 Implementation Progress

As we approach our April 1, 2025 launch date, our design system has reached a mature state with most standards fully defined and implemented. The recent focus on accessibility and responsive design has enhanced the platform's usability across devices and user capabilities.

### Key Achievements:
- ✅ Comprehensive color system with dark mode support
- ✅ Typography standards with responsive scaling
- ✅ Component styling guidelines with consistent patterns
- ✅ Code style enforcement with ESLint and Prettier
- ✅ Documentation standards with consistent formatting

### Current Focus:
- 🟡 Enhancing accessibility compliance to WCAG 2.1 AA
- 🟡 Optimizing responsive behavior for complex components
- 🟡 Refining animation standards for performance
- 🟡 Expanding email template variations

### Next Steps:
1. Complete accessibility audit and remediation
2. Finalize responsive design patterns for all components
3. Document animation and transition standards
4. Create comprehensive email template library
5. Implement automated style checking in CI/CD pipeline 