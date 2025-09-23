# Tutoring Portal

A standalone AI-powered tutoring platform extracted from the main boontutors application.

## Features

- 🤖 AI-powered lesson planning and content generation
- 📚 Student management and progress tracking
- 🎯 Personalized learning experiences
- 📊 Smart analytics and insights
- 💬 Interactive tutoring tools

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI**: OpenAI GPT and Google Gemini
- **UI Components**: Radix UI primitives
- **Animation**: Framer Motion

## Getting Started

1. Clone the repository and navigate to the tutoring app:
   \`\`\`bash
   cd apps/tutoring
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy the environment variables:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. Configure your environment variables in \`.env.local\`:
   - Set up your Supabase project credentials
   - Add your OpenAI API key
   - Add your Gemini API key

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── portal/         # Portal-specific components
│   └── ui/             # Reusable UI components
├── lib/                # Utility libraries
│   ├── agents.ts       # OpenAI agents
│   ├── gemini-agents.ts # Gemini agents
│   ├── database/       # Database utilities
│   └── supabase/       # Supabase client configuration
└── types/              # TypeScript type definitions
\`\`\`

## Key Components

### AI Agents
- **TutorCopilotAgent**: OpenAI-powered lesson planning and content generation
- **GeminiTutorCopilotAgent**: Gemini-powered alternative for AI functions

### Portal Components
- **PortalClient**: Main portal interface
- **StudentDashboard**: Student overview and management
- **SmartPrepStream**: AI-powered preparation tools
- **StudentManagement**: Student creation and editing

## Development

The application uses TypeScript for type safety and includes:
- ESLint for code linting
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for accessible components

## Contributing

This is a standalone extraction of the tutoring functionality. For the main application, see the parent boontutors repository.
