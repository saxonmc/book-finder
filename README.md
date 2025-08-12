# Book Finder

A modern web application for discovering, searching, and managing your personal book collection. Built with React, TypeScript, Express.js, and PostgreSQL.

## Features

- 🔍 **Real Book Search**: Search through millions of books via Google Books API
- 📚 **Book Details**: View comprehensive book information including covers, descriptions, ratings
- 🎨 **Modern UI**: Beautiful, responsive design with dark/light mode
- ⚡ **Fast Performance**: React Query for efficient data fetching and caching
- 📱 **Mobile Friendly**: Optimized for all devices
- 🔄 **URL State**: Search queries are preserved in the URL for sharing
- 🔐 **User Authentication**: Secure login and registration (coming soon)
- ⭐ **Personal Library**: Save and track your reading progress (coming soon)
- ⭐ **Reviews & Ratings**: Rate and review books (coming soon)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **Passport.js** for authentication
- **WebSocket** for real-time features
- **Session management** with express-session

### Database
- **SQLite** for development (ready for PostgreSQL)
- **Drizzle ORM** for type-safe database operations
- **Database migrations** with Drizzle Kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd book-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

The default configuration uses SQLite for easy development.

4. Set up the database:
```bash
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check
- `npm run db:setup` - Set up database tables

## Project Structure

```
book-finder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                # Express backend
│   └── index.ts
├── shared/                # Shared types and schema
│   └── schema.ts
├── migrations/            # Database migrations
└── dist/                 # Build output
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **books**: Book information and metadata
- **user_books**: Personal library and reading status
- **reviews**: User reviews and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 