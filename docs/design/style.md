# 📝 Style Guide [Beta v0.1.17]
📅 *Updated: March 1, 2025*

## 📌 Overview
Cloud Burst's style guide ensures consistent design, code, and documentation standards.

## 🎨 Design Standards
1. **Colors**
   ```typescript
   primary: "hsl(var(--primary))"
   secondary: "hsl(var(--secondary))"
   accent: "hsl(var(--accent))"
   background: "hsl(var(--background))"
   ```

2. **Typography**
   ```typescript
   fontSans: "'Inter', sans-serif"
   fontMono: "'Fira Code', monospace"
   ```

3. **Spacing**
   ```typescript
   space: {
     px: "1px",
     0.5: "0.125rem",
     1: "0.25rem",
     // ...
   }
   ```

## 💻 Code Style
1. **TypeScript**
   - Strict mode enabled
   - Interface over type
   - Explicit return types
   - Proper error handling
   - Comprehensive comments

2. **React**
   - Functional components
   - Custom hooks
   - Proper prop types
   - Error boundaries
   - Performance optimization

3. **CSS/Tailwind**
   - Utility-first approach
   - Component classes
   - Responsive design
   - Dark mode support
   - Accessibility classes

## 📚 Documentation
1. **Markdown**
   - Clear headings
   - Code blocks
   - Examples
   - Links
   - Images

2. **Comments**
   - TSDoc format
   - Clear descriptions
   - Parameter docs
   - Return types
   - Examples

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
   ```

3. **Email Colors**
   ```css
   /* Brand colors */
   color: #3b82f6; /* primary */
   background-color: #ffffff; /* background */
   ```

4. **Responsive Email**
   ```css
   /* Mobile-first approach */
   @media screen and (max-width: 600px) {
     .email-container {
       width: 100% !important;
     }
   }
   ```

5. **Email Accessibility**
   - Alt text for images
   - Semantic HTML structure
   - Sufficient color contrast
   - Text alternatives for buttons
   - Clear hierarchy 