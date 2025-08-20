import React from 'react';
import { Game } from '../types/playerTypes';
import { parseGameScore, getTeamName, determineGameResult } from '../utils/gameUtils';
import './Games.css';

interface RecentGamesProps {
  games: Game[];
  isLoading: boolean;
  hasError: boolean;
}

const RecentGames: React.FC<RecentGamesProps> = ({ games, isLoading, hasError }) => {
  const renderGame = (game: Game, index: number) => {
    
    if (game.competitions) {
      // API data format
      const competition = game.competitions[0];
      
      if (!competition || !competition.competitors) {
        console.log('Invalid competition data:', competition);
        return (
          <div key={index} className="game-card">
            <div className="game-info">
              <div className="game-teams">Invalid game data</div>
              <div className="game-details">Competition missing</div>
            </div>
          </div>
        );
      }
      
      const teams = competition.competitors;
      
      const homeTeam = teams.find((t: any) => t.homeAway === 'home');
      const awayTeam = teams.find((t: any) => t.homeAway === 'away');
      
      if (!homeTeam || !awayTeam) {
        return (
          <div key={index} className="game-card">
            <div className="game-info">
              <div className="game-teams">Teams data missing</div>
              <div className="game-details">Home/Away not found</div>
            </div>
          </div>
        );
      }
      
      const gameDate = new Date(game.date || '');
      const dateStr = gameDate.toLocaleDateString();
      
      const awayScore = parseGameScore(awayTeam.score);
      const homeScore = parseGameScore(homeTeam.score);
      
      const awayTeamName = getTeamName(awayTeam);
      const homeTeamName = getTeamName(homeTeam);
      
      const gameInfo = `${awayTeamName} ${awayScore} - ${homeScore} ${homeTeamName}`;
      const gameResult = determineGameResult(awayTeamName, homeTeamName, awayScore, homeScore);
      
      return (
        <div key={index} className="game-card">
          <div className="game-info">
            <div className="game-teams">{gameInfo}</div>
            <div className="game-details">{dateStr}</div>
          </div>
          <div className="game-score">
            <div className={`game-result ${gameResult}`}>
              {gameResult === 'win' ? 'W' : 'L'}
            </div>
          </div>
        </div>
      );
    } else {
      // Fallback format
      return (
        <div key={index} className="game-card">
          <div className="game-info">
            <div className="game-teams">{game.teams || 'No game data'}</div>
            <div className="game-details">{game.date || 'No date'}</div>
          </div>
          <div className="game-score">
            <div className={`game-result ${game.result?.toLowerCase() === 'w' ? 'win' : 'loss'}`}>
              {game.result || '?'}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section className="recent-section">
      <h2>Recent Results</h2>
      <div className="games-container">
        {isLoading ? (
          <div className="loading">Loading results...</div>
        ) : hasError ? (
          <div className="error-message">❌ Unable to load live game results</div>
        ) : games.length === 0 ? (
          <div className="loading">No recent games available</div>
        ) : (
          games.map(renderGame)
        )}
      </div>
    </section>
  );
};

export default RecentGames;