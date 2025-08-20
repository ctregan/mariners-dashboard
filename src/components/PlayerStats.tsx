import React from 'react';
import './PlayerStats.css';

interface Player {
  name: string;
  position: string;
  avg?: string;
  hr?: string;
  rbi?: string;
  era?: string;
  wins?: string;
  so?: string;
}

interface PlayerStatsProps {
  players: Player[];
  isLoading: boolean;
  hasError: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players, isLoading, hasError }) => {
  const renderPlayer = (player: Player, index: number) => {
    const stats = player.era ? 
      <>
        <div className="stat-item">
          <span className="stat-value">{player.era}</span>
          <span className="stat-label">ERA</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{player.wins}</span>
          <span className="stat-label">W</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{player.so}</span>
          <span className="stat-label">SO</span>
        </div>
      </> :
      <>
        <div className="stat-item">
          <span className="stat-value">{player.avg}</span>
          <span className="stat-label">AVG</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{player.hr}</span>
          <span className="stat-label">HR</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{player.rbi}</span>
          <span className="stat-label">RBI</span>
        </div>
      </>;

    return (
      <div key={index} className="player-card">
        <div className="player-name">{player.name}</div>
        <div className="player-position">{player.position}</div>
        <div className="player-stats">{stats}</div>
      </div>
    );
  };

  return (
    <section className="player-stats-section">
      <h2>Key Player Stats</h2>
      <div className="stats-grid">
        {isLoading ? (
          <div className="loading">Loading player stats...</div>
        ) : hasError ? (
          <div className="error-message">❌ Unable to load live player statistics</div>
        ) : players.length === 0 ? (
          <div className="loading">No player stats available</div>
        ) : (
          players.map(renderPlayer)
        )}
      </div>
    </section>
  );
};

export default PlayerStats;