import React from 'react';
import './TeamRecord.css';

interface TeamRecordProps {
  wins: string;
  losses: string;
  pct: string;
  isLoading: boolean;
  hasError: boolean;
}

const TeamRecord: React.FC<TeamRecordProps> = ({ wins, losses, pct, isLoading, hasError }) => {
  return (
    <section className="stats-section">
      <h2>2025 Season</h2>
      {hasError ? (
        <div className="error-message">
          ❌ Unable to load live team record data
        </div>
      ) : (
        <div className="record-card">
          <div className="record-item">
            <span className="record-label">Wins</span>
            <span className="record-value">{isLoading ? '--' : wins}</span>
          </div>
          <div className="record-item">
            <span className="record-label">Losses</span>
            <span className="record-value">{isLoading ? '--' : losses}</span>
          </div>
          <div className="record-item">
            <span className="record-label">PCT</span>
            <span className="record-value">{isLoading ? '--' : pct}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamRecord;