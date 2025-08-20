# Seattle Mariners Dashboard

A React TypeScript Progressive Web App (PWA) providing live statistics and game information for the Seattle Mariners baseball team.

## Features

- **Live Team Record**: Current season wins, losses, and win percentage
- **Recent Games**: Last 5 completed games with scores and results
- **Upcoming Games**: Next 5 scheduled games
- **Key Player Stats**: Season statistics for selected players
- **Organization Stats**: Complete MLB and AAA (Tacoma Rainiers) roster statistics with sortable tables
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **PWA Support**: Installable as a native app

## Tech Stack

- **React 18** with TypeScript
- **Modern CSS** with responsive design
- **Live APIs**: ESPN and MLB.com official APIs
- **Testing**: Jest with React Testing Library
- **Build Tool**: Create React App

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
npm install
npm start
```

The app runs at `http://localhost:3001/mariners`

### Testing
```bash
npm test
```

### Build
```bash
npm run build
```

## Architecture

### Components
- `MarinersDashboard`: Main container component
- `TeamRecord`: Displays win/loss record
- `RecentGames` & `UpcomingGames`: Game history and schedule
- `PlayerStats`: Key player statistics cards
- `PlayerStatsTable`: Comprehensive sortable tables for organization

### Utilities
- `apiUtils`: Caching and API management
- `gameUtils`: Game data parsing and utilities
- `constants/teamConstants`: Team IDs and API endpoints
- `types/playerTypes`: TypeScript interfaces

### Data Sources
- **ESPN API**: Team records, schedules, and game results
- **MLB.com API**: Player statistics and roster information
- **Caching**: 10-minute cache for API responses

## Deployment

This app is designed to be deployed as part of a larger launcher system with multiple PWAs on separate Vercel subdomains.

## Contributing

1. Follow existing code patterns and conventions
2. Add tests for new utilities
3. Use TypeScript strictly
4. Maintain responsive design
5. Keep API calls efficient with caching