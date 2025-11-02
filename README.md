# AI Agent Call Simulator

A clean, optimized React application that simulates an AI agent handling customer calls with supervisor oversight.

## Features

- **AI Agent Simulator**: Simulates customer calls with basic knowledge base
- **Supervisor Dashboard**: Manage help requests and build knowledge base
- **Real-time Updates**: Live updates using Supabase subscriptions
- **Clean UI**: Minimal, responsive design with shadcn/ui components

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui components, Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses three main tables:
- `help_requests`: Stores customer questions that need supervisor help
- `supervisor_responses`: Stores supervisor answers to help requests
- `knowledge_base`: Stores learned Q&A pairs for the AI agent

## Project Structure

```
src/
├── components/
│   ├── ai/              # AI agent simulator
│   ├── supervisor/      # Supervisor dashboard components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client and types
├── lib/                 # Utility functions
└── pages/               # Route components
```

## Optimization Features

- Removed unused dependencies and UI components
- Optimized database queries with parallel operations
- Clean, readable code structure
- Minimal bundle size with only necessary components
