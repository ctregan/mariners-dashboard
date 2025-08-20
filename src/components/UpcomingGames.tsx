import React from 'react';
import './Games.css';

interface Game {
  teams?: string;
  date?: string;
  location?: string;
  competitions?: any[];
}

interface UpcomingGamesProps {
  games: Game[];
  isLoading: boolean;
  hasError: boolean;
}

const UpcomingGames: React.FC<UpcomingGamesProps> = ({ games, isLoading, hasError }) => {
  const renderGame = (game: Game, index: number) => {
    if (game.competitions) {
      // API data format
      const competition = game.competitions[0];
      const teams = competition.competitors;
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');
      
      const gameDate = new Date(game.date || '');
      const dateStr = gameDate.toLocaleDateString() + ' ' + gameDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const gameInfo = `${awayTeam.team.displayName} @ ${homeTeam.team.displayName}`;
      
      return (
        <div key={index} className="game-card">
          <div className="game-info">
            <div className="game-teams">{gameInfo}</div>
            <div className="game-details">{dateStr}</div>
          </div>
        </div>
      );
    } else {
      // Mock data format
      return (
        <div key={index} className="game-card">
          <div className="game-info">
            <div className="game-teams">{game.teams}</div>
            <div className="game-details">{game.date} • {game.location}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="schedule-section">
      <h2>Upcoming Games</h2>
      <div className="games-container">
        {isLoading ? (
          <div className="loading">Loading schedule...</div>
        ) : hasError ? (
          <div className="error-message">❌ Unable to load live schedule data</div>
        ) : games.length === 0 ? (
          <div className="loading">No upcoming games scheduled</div>
        ) : (
          games.map(renderGame)
        )}
      </div>
    </section>
  );
};

export default UpcomingGames;