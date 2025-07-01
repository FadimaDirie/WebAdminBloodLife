# Emergency Blood Donation Dashboard

## Overview

This is a full-stack emergency blood donation dashboard application built with React, Express.js, and PostgreSQL. The system manages blood donations, emergency requests, inventory tracking, and donor management with blockchain integration for transaction verification. The application uses mock data for demonstration purposes and implements a comprehensive UI with real-time updates.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React-based single-page application using Vite as the build tool
- **Backend**: Express.js server with REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Well-organized component hierarchy with shared UI components
- **Styling**: Tailwind CSS with custom healthcare-themed color variables
- **State Management**: React hooks with TanStack Query for API state
- **Routing**: File-based routing with Wouter
- **Build System**: Vite with TypeScript support and React plugin

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with /api prefix
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Database Integration**: Drizzle ORM with PostgreSQL support
- **Development Tools**: Hot reload with Vite middleware integration

### Database Schema
The application defines comprehensive schemas for:
- **Users**: Authentication and user management
- **Donors**: Donor information and activity tracking
- **Donations**: Blood donation records with blockchain transaction hashes
- **Emergency Requests**: Hospital emergency blood requests
- **Blood Inventory**: Real-time inventory tracking with expiration dates

### UI Components
- **Dashboard**: Comprehensive dashboard with real-time statistics
- **Charts**: Multiple chart types using Recharts for data visualization
- **Tables**: Sortable and filterable tables for data management
- **Forms**: Form components with validation using react-hook-form
- **Layout**: Responsive sidebar navigation with mobile support

## Data Flow

1. **Client Requests**: Frontend makes API calls through TanStack Query
2. **API Processing**: Express server processes requests and interacts with storage layer
3. **Data Storage**: Drizzle ORM manages database operations with type safety
4. **Real-time Updates**: Simulated real-time updates for dashboard statistics
5. **Response Handling**: Type-safe responses with proper error handling

## External Dependencies

### Core Dependencies
- **React 18**: Frontend framework with concurrent features
- **Express.js**: Backend server framework
- **Drizzle ORM**: Type-safe database ORM
- **Neon Database**: Serverless PostgreSQL database
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first CSS framework

### UI Dependencies
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library
- **Wouter**: Lightweight routing

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast JavaScript bundler
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with Express middleware
- **Database**: Development database with schema migrations
- **Build Process**: Concurrent frontend and backend development

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: ESBuild bundles Express server for Node.js
- **Database**: Production PostgreSQL with connection pooling
- **Static Assets**: Frontend assets served through Express

### Replit Integration
- **Development Banner**: Replit development banner for external access
- **Runtime Error Overlay**: Development error reporting
- **Cartographer**: Replit-specific development tools

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```