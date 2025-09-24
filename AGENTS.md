# Daily Planner Application Architecture and Components

## Overview

The Daily Planner is a comprehensive full-stack web application that consolidates tasks, events, and calendars into a unified interface. Built with React (frontend) and Node.js/Express (backend), it features drag-and-drop functionality, calendar integrations, task imports, collaboration tools, and advanced features like natural language processing for task creation.

### System Architecture

```
[Frontend (React SPA)]
    ↓ HTTP/REST + WebSocket
[Backend (Express.js API)]
    ↓ Database queries
[PostgreSQL Database]
    ↔ External Integrations (Google Calendar, Notion, etc.)
```

### Technology Stack

- **Frontend**: React 18+, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, React Query, Zustand
- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL, TypeORM, Passport.js
- **Authentication**: JWT tokens, OAuth2 for external services
- **State Management**: React Query (server state), Zustand (client state)

## Backend Agents/Components

### Core Infrastructure

#### `backend/src/data-source.ts`

**Role**: Database configuration and connection management
**Functionality**:

- Configures TypeORM DataSource with PostgreSQL connection
- Defines entity imports and migration settings
- Handles database initialization and connection pooling
- Environment-based configuration (host, port, credentials)
  **Interactions**: Used by all route handlers and services for database operations

#### `backend/src/index.ts`

**Role**: Main application server setup and orchestration
**Functionality**:

- Initializes Express application with middleware (CORS, JSON parsing)
- Sets up Passport.js authentication strategies
- Registers all API route handlers
- Configures error handling middleware
- Starts HTTP server on configured port
  **Interactions**: Entry point that coordinates all backend components

### Authentication & Security

#### `backend/src/middleware/auth.ts`

**Role**: JWT token-based authentication middleware
**Functionality**:

- Validates Bearer tokens in request headers
- Verifies token signatures and expiration
- Retrieves user data from database
- Attaches authenticated user to request object
- Handles token refresh and invalidation
  **Interactions**: Applied to protected routes across all API endpoints

#### `backend/src/config/passport.ts`

**Role**: OAuth2 authentication strategies for external services
**Functionality**:

- Configures Passport strategies for Google Calendar, Microsoft Outlook, Apple Calendar
- Handles OAuth2 callback processing and token storage
- Manages refresh token logic for continued access
- Prepares user profile data for calendar integration
  **Interactions**: Used by calendar routes for OAuth2 flows

### API Routes

#### `backend/src/routes/auth.ts`

**Role**: User authentication endpoints
**Functionality**:

- User registration with password hashing (bcrypt)
- Login with credential validation
- JWT token generation and response
- OAuth2 placeholder endpoints for future implementation
  **Interactions**: Called by frontend auth components

#### `backend/src/routes/users.ts`

**Role**: User profile management
**Functionality**:

- Retrieve current user profile
- Update user information (name, email)
- Profile data validation and sanitization
  **Interactions**: Used by frontend user settings

#### `backend/src/routes/tasks.ts`

**Role**: Task CRUD operations
**Functionality**:

- Full CRUD for tasks with subtasks support
- Category association and filtering
- Priority and status management
- Due date and recurrence handling
  **Interactions**: Primary interface for task management features

#### `backend/src/routes/events.ts`

**Role**: Calendar event management
**Functionality**:

- Event creation, updating, deletion
- Time slot validation and conflict checking
- Recurrence pattern support (RRULE)
- External calendar event synchronization
  **Interactions**: Powers calendar view and event scheduling

#### `backend/src/routes/categories.ts`

**Role**: Task category management
**Functionality**:

- CRUD operations for user-defined categories
- Color assignment for visual distinction
- Default categories (Work, Family, Personal, Travel)
  **Interactions**: Used by task creation and filtering

#### `backend/src/routes/calendars.ts`

**Role**: External calendar integration management
**Functionality**:

- OAuth2 authentication initiation
- Calendar connection/disconnection
- Event synchronization from external providers
- Token refresh and error handling
  **Interactions**: Enables unified calendar view with external sources

#### `backend/src/routes/taskImports.ts`

**Role**: Task import configuration
**Functionality**:

- API key/credential storage for external services
- Import connection management
- Provider-specific configuration
  **Interactions**: Prepares for task import operations

#### `backend/src/routes/import.ts`

**Role**: Task import execution
**Functionality**:

- Trigger imports from configured services
- Data transformation and deduplication
- Import history tracking
- Error handling and rollback
  **Interactions**: Processes bulk task imports

#### `backend/src/routes/collaborations.ts`

**Role**: Collaboration management
**Functionality**:

- Invite collaborators to tasks/events
- Permission level management (read/write/admin)
- Collaboration retrieval and updates
  **Interactions**: Enables shared task/event functionality

### Data Models (Entities)

#### `backend/src/entities/User.ts`

**Role**: User account representation
**Functionality**:

- Stores authentication credentials
- Profile information (name, email, avatar)
- Timestamps for account management
  **Relationships**: One-to-many with tasks, events, categories

#### `backend/src/entities/Task.ts`

**Role**: Task data model
**Functionality**:

- Core task properties (title, description, priority, status)
- Due dates and recurrence rules
- Category and user associations
- Subtask relationships
  **Relationships**: Belongs to user and category, has many subtasks

#### `backend/src/entities/Event.ts`

**Role**: Calendar event model
**Functionality**:

- Time-based scheduling (start/end times)
- Location and description fields
- Recurrence support (RRULE)
- External calendar integration fields
  **Relationships**: Belongs to user, many-to-many with collaborations

#### `backend/src/entities/Category.ts`

**Role**: Task categorization
**Functionality**:

- User-defined categories with colors
- Visual organization of tasks
- Default system categories
  **Relationships**: One-to-many with tasks

#### `backend/src/entities/Subtask.ts`

**Role**: Task breakdown support
**Functionality**:

- Checklist items within tasks
- Completion tracking
- Progress calculation
  **Relationships**: Belongs to task

#### `backend/src/entities/Collaboration.ts`

**Role**: Shared resource management
**Functionality**:

- Permission-based access control
- Resource type identification (task/event)
- Invitation and acceptance workflow
  **Relationships**: Links users to shared resources

#### `backend/src/entities/CalendarIntegration.ts`

**Role**: External calendar connections
**Functionality**:

- OAuth2 token storage
- Provider-specific configuration
- Sync status tracking
  **Relationships**: Belongs to user

#### `backend/src/entities/TaskImport.ts` & `ImportHistory.ts`

**Role**: Task import management
**Functionality**:

- Import configuration storage
- Execution history and status
- Error tracking and reporting
  **Relationships**: Belongs to user, tracks import operations

### Services

#### `backend/src/services/nlpService.ts`

**Role**: Natural language processing for task creation
**Functionality**:

- Parses plain text into structured task data
- Extracts dates, times, locations, priorities
- Handles recurrence patterns
- Regex-based pattern matching
  **Interactions**: Used by NLP API endpoints

#### `backend/src/services/schedulingService.ts`

**Role**: Intelligent scheduling suggestions
**Functionality**:

- Analyzes calendar availability
- Detects scheduling conflicts
- Provides optimal time slot recommendations
- Considers user preferences and patterns
  **Interactions**: Powers smart scheduling features

#### `backend/src/services/calendarService.ts`

**Role**: External calendar synchronization
**Functionality**:

- Provider-specific API integrations
- Event data transformation
- Bidirectional sync management
- Error handling and retry logic
  **Interactions**: Manages calendar import/export operations

#### `backend/src/services/taskImport/`

**Role**: Multi-provider task import system
**Functionality**:

- Abstract factory pattern for different providers
- Provider-specific data fetching and transformation
- Deduplication and conflict resolution
- Batch processing with progress tracking
  **Components**:
- `TaskImportServiceFactory.ts`: Provider instantiation
- `ITaskImportService.ts`: Common interface
- Provider-specific services (Notion, ClickUp, Linear, Todoist)

### Middleware

#### `backend/src/middleware/validation.ts`

**Role**: Request validation and sanitization
**Functionality**:

- Input validation using express-validator
- Schema-based validation rules
- Error formatting and response
  **Interactions**: Applied to all POST/PUT endpoints

#### `backend/src/middleware/errorHandler.ts`

**Role**: Centralized error processing
**Functionality**:

- Catches unhandled errors
- Formats error responses
- Logs errors for debugging
- Handles different error types appropriately
  **Interactions**: Global error handling middleware

### Database Migrations

**Role**: Schema evolution management
**Functionality**:

- Incremental database schema updates
- Version-controlled schema changes
- Rollback capability
- Environment-specific execution
  **Files**: Sequential migration files for each schema change

## Frontend Agents/Components

### Application Entry Points

#### `frontend/vite.config.ts`

**Role**: Build tool configuration
**Functionality**:

- Vite bundler setup with React plugin
- Path aliases configuration (@/src)
- Development server settings
- Build optimization options
  **Interactions**: Controls frontend build process

#### `frontend/src/main.tsx`

**Role**: React application bootstrap
**Functionality**:

- Creates React root and renders App component
- Wraps application with React Query provider
- Enables StrictMode for development checks
  **Interactions**: Entry point for React application

#### `frontend/src/App.tsx`

**Role**: Main application layout
**Functionality**:

- Defines overall page structure
- Renders Header, Sidebar, and MainPanel components
- Manages responsive layout with Tailwind CSS
  **Interactions**: Root component coordinating layout

### State Management

#### `frontend/src/store/appStore.ts`

**Role**: Global application state
**Functionality**:

- Current view management (calendar/settings)
- Week navigation state and logic
- Loading states for UI feedback
- Date calculations and week boundaries
  **Interactions**: Used by Header and CalendarView components

#### `frontend/src/lib/api.ts`

**Role**: API client and data fetching
**Functionality**:

- React Query hooks for all API endpoints
- CRUD operations for tasks, events, categories
- Authentication header management
- Optimistic updates and cache invalidation
- Error handling and retry logic
  **Interactions**: Primary interface between frontend and backend

### UI Components

#### Layout Components

- **`frontend/src/components/layout/Header.tsx`**: Navigation bar with week controls
- **`frontend/src/components/layout/Sidebar.tsx`**: Task sidebar with categories and filters
- **`frontend/src/components/layout/MainPanel.tsx`**: Main content area container

#### Calendar Components

- **`frontend/src/components/calendar/CalendarView.tsx`**: Main calendar container with week navigation
- **`frontend/src/components/calendar/CalendarGrid.tsx`**: Grid layout for time slots and events
- **`frontend/src/components/calendar/DayColumn.tsx`**: Individual day column with time slots
- **`frontend/src/components/calendar/TimeSlot.tsx`**: Hourly time slot with drop zones
- **`frontend/src/components/calendar/EventCard.tsx`**: Draggable event/task display

#### Task Components

- **`frontend/src/components/tasks/TaskList.tsx`**: Task list with filtering and sorting
- **`frontend/src/components/tasks/TaskItem.tsx`**: Individual task with subtasks and actions
- **`frontend/src/components/tasks/TaskFilters.tsx`**: Category and status filtering
- **`frontend/src/components/tasks/NLPInput.tsx`**: Natural language task creation
- **`frontend/src/components/tasks/SchedulingSuggestions.tsx`**: Smart scheduling recommendations
- **`frontend/src/components/tasks/RecurringConfig.tsx`**: Recurrence pattern configuration

#### Settings Components

- **`frontend/src/components/settings/CalendarSettings.tsx`**: Calendar integration management
- **`frontend/src/components/settings/TaskImportSettings.tsx`**: Task import configuration

#### Collaboration Components

- **`frontend/src/components/collaboration/InviteCollaborator.tsx`**: User invitation interface
- **`frontend/src/components/collaboration/ManageSharedResources.tsx`**: Shared resource management

#### UI Library Components

- **`frontend/src/components/ui/`**: Reusable UI components (Button, Card, Input, Select)

### Hooks and Utilities

#### `frontend/src/hooks/useDragDrop.ts`

**Role**: Drag-and-drop functionality
**Functionality**:

- HTML5 Drag API implementation
- Task-to-calendar conversion logic
- Conflict checking during drops
- Visual feedback and state management
  **Interactions**: Used by TaskItem and TimeSlot components

#### `frontend/src/lib/utils.ts`

**Role**: Utility functions
**Functionality**:

- `cn()` function for Tailwind class merging
- Common utility functions for styling and data manipulation
  **Interactions**: Used throughout the application for consistent styling

## Data Flow

### Authentication Flow

1. User submits credentials → `auth.ts` route
2. Password validation → JWT token generation
3. Token stored in localStorage → API requests include Bearer token
4. `auth.ts` middleware validates tokens on protected routes

### Task Creation Flow

1. User input (text or form) → `NLPInput` or `TaskItem` component
2. Data sent to `api.ts` → React Query mutation
3. API call to `tasks.ts` route → Validation middleware
4. Database save via TypeORM → Response to frontend
5. Cache invalidation → UI updates

### Calendar Integration Flow

1. User initiates OAuth → `CalendarSettings` component
2. Redirect to provider → OAuth callback
3. Token storage → `CalendarIntegration` entity
4. Sync trigger → `calendarService.ts` fetches external events
5. Data transformation → Save to `Event` entities
6. UI refresh → Events appear in calendar

### Drag-and-Drop Flow

1. Task drag start → `useDragDrop` hook
2. Visual feedback → Calendar highlights valid drop zones
3. Drop on time slot → Conflict checking
4. Task converted to event → API update
5. Calendar re-renders → Event appears in new position

## Notable Integrations and Dependencies

### External Service Integrations

- **Google Calendar API**: OAuth2 authentication, event synchronization
- **Microsoft Graph API**: Outlook calendar integration
- **Notion API**: Task database import with API key authentication
- **ClickUp API**: Project and task import
- **Linear API**: Issue tracking integration
- **Todoist API**: Task list synchronization

### Key Dependencies

- **Frontend**:

  - React Query: Server state management and caching
  - Zustand: Client-side state management
  - TailwindCSS: Utility-first styling
  - shadcn/ui: Component library built on Radix UI
  - Framer Motion: Animation library
  - React DnD: Drag-and-drop functionality

- **Backend**:
  - TypeORM: Database ORM with migration support
  - Passport.js: Authentication middleware
  - express-validator: Request validation
  - bcryptjs: Password hashing
  - jsonwebtoken: JWT token management

### Database Design Patterns

- **Entity Relationships**: Proper foreign key constraints and cascading
- **Migration Strategy**: Version-controlled schema evolution
- **Indexing**: Optimized queries for common access patterns
- **Data Integrity**: Validation at application and database levels

### Security Considerations

- **Authentication**: JWT with expiration, secure token storage
- **Authorization**: Role-based access control for collaborations
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Configuration**: Proper cross-origin request handling
- **Environment Variables**: Sensitive data stored securely

This architecture provides a scalable, maintainable foundation for the daily planner application with clear separation of concerns and robust integration capabilities.
