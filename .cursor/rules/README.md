# Cloud Burst Development Rules

## 🎯 Overview
These rules define the development standards and practices for the Cloud Burst project. They are designed to be used by both developers and AI assistants to maintain consistency and quality across the codebase.

## 📚 Rule Categories

### Core Development
- [Code Style](code-style.mdc) - Coding standards and formatting rules
- [TypeScript](typescript.mdc) - TypeScript configuration and best practices
- [React Components](react-components.mdc) - Component architecture and patterns
- [Documentation Standards](documentation-standards.mdc) - Documentation requirements

### Architecture & State
- [API Standards](api.mdc) - API design and implementation guidelines
- [State Management](state-management.mdc) - Zustand store structure and patterns

### Quality & Testing
- [Testing Standards](testing.mdc) - Testing methodologies and requirements
- [Performance Standards](performance-standards.mdc) - Performance metrics and optimization
- [Security](security.mdc) - Security practices and configurations

### Accessibility & UX
- [Accessibility](accessibility.mdc) - WCAG compliance and a11y standards

### Authentication & Authorization
- [Auth Standards](auth-standards.mdc) - Authentication and authorization patterns
- [Route Protection](route-protection.mdc) - Protected route implementation

### Data Management
- [Database Schema](database-schema.mdc) - Supabase database structure
- [Storage Rules](storage-rules.mdc) - File storage and management

## 🤖 AI Integration
- [AI Collaboration Guidelines](ai-collaboration-guidelines.mdc) - AI pair programming standards
- [AI Features](ai-features.mdc) - AI/ML implementation guidelines

## 🔄 Rule Updates
Rules should be updated when:
1. New technologies are adopted
2. Best practices evolve
3. Project requirements change
4. Performance metrics are adjusted
5. Security requirements update
6. Accessibility standards change

## 📋 Rule Format
Each rule file follows this structure:
```typescript
{
  description: string;
  globs: string[];
  rules: {
    [category: string]: {
      [rule: string]: any;
    };
  };
}
```

## 🔍 Version Control
- Rules are versioned alongside the codebase
- Changes require PR review
- Major changes require team discussion
- AI assistants follow latest rules