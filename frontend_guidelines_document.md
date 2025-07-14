# Frontend Guideline Document

This document lays out the frontend setup for MycoPod, an AI-powered tool for managing Proxmox clusters with natural language. It covers architecture, design principles, styling, component structure, state management, routing, performance, testing, and a summary.

## 1. Frontend Architecture

### Frameworks and Libraries
- **React** with **TypeScript**: For building robust, type-safe user interfaces.
- **Vite**: Fast build tool and development server.
- **React Router**: Handles routing and navigation.
- **CSS Modules**: Scoped styling per component.

### Architecture Highlights
- **Component-Based Structure**: Small, reusable UI pieces that map directly to features (e.g., DeclarationForm, PlanView, ApprovalPanel).
- **Layered Approach**: UI components → hooks/services → API layer.
- **API Layer**: A set of functions handling requests to the backend (Proxmox API, GitHub API, reconciliation logs).
- **Context for Global State**: Central place for user session, role info, and live plan data.

### Scalability, Maintainability, Performance
- **Scalability**: Easy to add new pages or features by dropping in new components and routes.
- **Maintainability**: TypeScript types and CSS Modules reduce runtime errors and style conflicts.
- **Performance**: Vite’s instant hot-reload, code splitting with React.lazy, and optimized production builds.

## 2. Design Principles

### Key Principles
- **Usability**: Clear labels, simple forms, and confirmation dialogs.
- **Accessibility**: Keyboard navigation, proper ARIA attributes, and contrast-checked colors.
- **Responsiveness**: Works on desktops, tablets, and smaller screens.
- **Clarity**: Minimize cognitive load with whitespace and straightforward layouts.

### Application in UI
- **Forms and Buttons**: Large click/tap targets, inline error messages.
- **Feedback**: Loading spinners, success/failure toasts, detailed status tables.
- **Navigation**: Sidebar with clear icons and text, always visible on desktop, collapsible on mobile.

## 3. Styling and Theming

### Styling Approach
- **CSS Modules**: Each component has its own `.module.css` file to avoid global clashes.
- **No Pre-processor**: Keep CSS simple; Vite handles minification.

### Theming
- **Light Mode Only**: Consistent, neutral background and text colors.
- **Custom Properties**: Defined in `:root` for easy tweaks (e.g., `--primary-color`).

### Visual Style
- **Flat & Modern**: Minimal shadows, clear lines, no skeuomorphism.

### Color Palette
- Primary: #3B82F6 (blue)
- Secondary: #6B7280 (gray)
- Background: #F9FAFB (off-white)
- Surface: #FFFFFF (white)
- Text Primary: #111827 (dark gray)
- Text Secondary: #4B5563 (medium gray)
- Success: #10B981 (green)
- Error: #EF4444 (red)

### Typography
- **Font Family**: Inter, sans-serif
- **Base Size**: 16px
- **Line Height**: 1.5

## 4. Component Structure

### Organization
- **/src/components**: Reusable UI pieces (buttons, modals, form fields).
- **/src/pages**: Top-level views (SignIn, Declaration, Plan, Approval, Status).
- **/src/hooks**: Custom React hooks for data fetching or shared logic.
- **/src/services**: API functions and data models.
- **/src/context**: Global state providers.

### Reuse and Consistency
- **Atomic Design**: Smaller atoms (Button, Input) build molecules (FormRow), which build organisms (DeclarationForm).
- **Single Responsibility**: Each component does one job, making it easy to test and maintain.

## 5. State Management

### Approach
- **React Context + useReducer**: Keeps track of user info, current declaration draft, and plan details.

### Global State Examples
- **AuthContext**: Holds user role (Admin/User), JWT token, and sign-in status.
- **PlanContext**: Stores the interpreted plan steps, reconciliation results, and loading states.

### Local Component State
- Used for form inputs, dropdown selections, and local UI toggles.

## 6. Routing and Navigation

### Routing Library
- **React Router v6**

### Route Structure
- `/sign-in` → SignInPage
- `/declaration` → DeclarationPage
- `/plan` → PlanPage
- `/approval` → ApprovalPage
- `/reconcile` → ReconcilePage
- `/status` → StatusPage

### Navigation Patterns
- **Protected Routes**: Guarded by role; only Admins can access `/approval` and `/reconcile`.
- **Redirects**: Unauthenticated users are sent to `/sign-in`.
- **Persistent Sidebar**: Quick links to all stages once logged in.

## 7. Performance Optimization

### Key Strategies
- **Code Splitting**: `React.lazy` and `Suspense` for large pages.
- **Asset Optimization**: Vite handles image and CSS minification.
- **Lazy Data Fetching**: Load only necessary data per page.
- **Memoization**: `React.memo` and `useMemo` for expensive renders.

### Impact on UX
- Faster initial load.
- Smooth navigation between pages.
- Reduced bandwidth usage.

## 8. Testing and Quality Assurance

### Unit Testing
- **Jest** with **React Testing Library**: Test components and hooks in isolation.

### Integration Testing
- Combine multiple components (e.g., form + API service) to verify data flow.

### End-to-End (E2E) Testing
- **Cypress**: Simulate user flows (sign-in, declare, approve, reconcile).

### Linting and Formatting
- **ESLint** with TypeScript rules.
- **Prettier** for consistent code style.

### Continuous Integration
- Run tests and lint on every pull request via GitHub Actions.

## 9. Conclusion and Overall Frontend Summary

The MycoPod frontend is built for clarity, speed, and reliability. A component-based React setup with TypeScript ensures safety and ease of extension. Simple design principles—usability, accessibility, responsiveness—keep the UI user-friendly. CSS Modules and a neutral color palette maintain a consistent look. Context-based state and React Router keep navigation smooth, while Vite and lazy-loading optimize performance. Comprehensive testing and CI keep code quality high. Together, these guidelines support MycoPod’s goal: empowering homelab owners with a seamless, transparent cluster management experience.