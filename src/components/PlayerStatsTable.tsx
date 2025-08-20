import React, { useState, useCallback, useEffect } from 'react';
import { Player } from '../types/playerTypes';
import { MARINERS_TEAM_IDS, API_ENDPOINTS, TeamLevel } from '../constants/teamConstants';
import './PlayerStatsTable.css';

interface PlayerStatsTableProps {
  isLoading: boolean;
  hasError: boolean;
}

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ isLoading, hasError }) => {
  const [activeTab, setActiveTab] = useState<TeamLevel>('MLB');
  const [players, setPlayers] = useState<{ [key in TeamLevel]: Player[] }>({
    MLB: [],
    AAA: []
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [loading, setLoading] = useState<{ [key in TeamLevel]: boolean }>({
    MLB: false,
    AAA: false
  });
  const [errors, setErrors] = useState<{ [key in TeamLevel]: boolean }>({
    MLB: false,
    AAA: false
  });


  // Team IDs for Mariners organization
  const teamIds = React.useMemo(() => ({
    MLB: MARINERS_TEAM_IDS.MLB,
    AAA: MARINERS_TEAM_IDS.AAA
  }), []);

  const makeAPICall = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }, []);

  const loadTeamRoster = useCallback(async (level: TeamLevel) => {
    setLoading(prev => ({ ...prev, [level]: true }));
    setErrors(prev => ({ ...prev, [level]: false }));

    try {
      const currentYear = new Date().getFullYear();
      const teamId = teamIds[level];
      
      
      // Try different API approaches for minor leagues
      let rosterData = null;
      
      if (level === 'MLB') {
        // Standard MLB API call
        rosterData = await makeAPICall(
          API_ENDPOINTS.MLB.ROSTER(teamId, currentYear)
        );
      } else {
        // For minor leagues, try different approaches
        // Approach 1: Standard roster call
        rosterData = await makeAPICall(
          API_ENDPOINTS.MLB.ROSTER(teamId, currentYear)
        );
        
        
        // Approach 2: Try without season parameter
        if (!rosterData || !rosterData.roster) {
          rosterData = await makeAPICall(
            `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active`
          );
        }
        
        // Approach 3: Try different roster types
        if (!rosterData || !rosterData.roster) {
          rosterData = await makeAPICall(
            `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=40Man&season=${currentYear}`
          );
        }
        
        // Approach 4: Try organization roster lookup
        if (!rosterData || !rosterData.roster) {
          // Get Mariners org affiliates first
          const orgData = await makeAPICall(
            API_ENDPOINTS.MLB.AFFILIATES(MARINERS_TEAM_IDS.MLB, currentYear)
          );
          
          if (orgData && orgData.teams) {
            // Find the correct affiliate
            const affiliate = orgData.teams.find((team: any) => {
              const teamName = team.name.toLowerCase();
              return level === 'AAA' && teamName.includes('tacoma');
            });
            
            
            if (affiliate) {
              rosterData = await makeAPICall(
                `https://statsapi.mlb.com/api/v1/teams/${affiliate.id}/roster?rosterType=active&season=${currentYear}`
              );
            }
          }
        }
      }


      if (rosterData && rosterData.roster) {
        // Get stats for each player
        const playersWithStats = await Promise.all(
          rosterData.roster.map(async (player: any) => {
            try {
              const statsData = await makeAPICall(
                API_ENDPOINTS.MLB.PLAYER_STATS(player.person.id, currentYear)
              );


              const basePlayer: Player = {
                id: player.person.id.toString(),
                name: player.person.fullName,
                position: player.position.abbreviation,
                age: player.person.currentAge,
                bats: player.person.batSide?.description,
                throws: player.person.pitchHand?.description
              };

              if (statsData && statsData.stats && statsData.stats.length > 0) {
                // Process hitting and pitching stats
                for (const statGroup of statsData.stats) {
                  if (statGroup.splits && statGroup.splits.length > 0) {
                    const stats = statGroup.splits[0].stat;
                    
                    if (statGroup.group.displayName === 'hitting') {
                      Object.assign(basePlayer, {
                        avg: stats.avg || '.000',
                        obp: stats.obp || '.000',
                        slg: stats.slg || '.000',
                        ops: stats.ops || '.000',
                        hr: stats.homeRuns?.toString() || '0',
                        rbi: stats.rbi?.toString() || '0',
                        runs: stats.runs?.toString() || '0',
                        hits: stats.hits?.toString() || '0',
                        doubles: stats.doubles?.toString() || '0',
                        triples: stats.triples?.toString() || '0',
                        sb: stats.stolenBases?.toString() || '0',
                        bb: stats.baseOnBalls?.toString() || '0',
                        so: stats.strikeOuts?.toString() || '0'
                      });
                    } else if (statGroup.group.displayName === 'pitching') {
                      Object.assign(basePlayer, {
                        era: stats.era || '0.00',
                        whip: stats.whip || '0.00',
                        wins: stats.wins?.toString() || '0',
                        losses: stats.losses?.toString() || '0',
                        saves: stats.saves?.toString() || '0',
                        ip: stats.inningsPitched || '0.0',
                        h: stats.hits?.toString() || '0',
                        er: stats.earnedRuns?.toString() || '0',
                        bb_p: stats.baseOnBalls?.toString() || '0',
                        so_p: stats.strikeOuts?.toString() || '0',
                        hr_p: stats.homeRuns?.toString() || '0'
                      });
                    }
                  }
                }
              }

              return basePlayer;
            } catch (playerError) {
              // Return player with basic info but no stats
              const isPitcher = ['SP', 'RP', 'CP', 'P'].includes(player.position.abbreviation);
              return {
                id: player.person.id.toString(),
                name: player.person.fullName,
                position: player.position.abbreviation,
                age: player.person.currentAge,
                bats: player.person.batSide?.description,
                throws: player.person.pitchHand?.description,
                // Add placeholder stats so table displays properly
                ...(isPitcher ? {
                  era: 'N/A',
                  whip: 'N/A',
                  wins: 'N/A',
                  losses: 'N/A',
                  saves: 'N/A',
                  ip: 'N/A',
                  so_p: 'N/A',
                  bb_p: 'N/A',
                  hr_p: 'N/A'
                } : {
                  avg: 'N/A',
                  obp: 'N/A',
                  slg: 'N/A',
                  ops: 'N/A',
                  hr: 'N/A',
                  rbi: 'N/A',
                  runs: 'N/A',
                  hits: 'N/A',
                  doubles: 'N/A',
                  triples: 'N/A',
                  sb: 'N/A',
                  bb: 'N/A',
                  so: 'N/A'
                })
              };
            }
          })
        );

        if (playersWithStats.length > 0) {
          setPlayers(prev => ({ ...prev, [level]: playersWithStats }));
          setErrors(prev => ({ ...prev, [level]: false }));
        } else {
          setErrors(prev => ({ ...prev, [level]: true }));
          setPlayers(prev => ({ ...prev, [level]: [] }));
        }
      } else {
        setErrors(prev => ({ ...prev, [level]: true }));
        setPlayers(prev => ({ ...prev, [level]: [] }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [level]: true }));
      setPlayers(prev => ({ ...prev, [level]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  }, [makeAPICall, teamIds]);

  useEffect(() => {
    // Load MLB roster by default
    loadTeamRoster('MLB');
  }, [loadTeamRoster]);

  const handleTabChange = (level: TeamLevel) => {
    setActiveTab(level);
    if (players[level].length === 0 && !loading[level] && !errors[level]) {
      loadTeamRoster(level);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = React.useMemo(() => {
    const currentPlayers = players[activeTab];
    if (!sortConfig) return currentPlayers;

    return [...currentPlayers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Player];
      const bValue = b[sortConfig.key as keyof Player];

      if (aValue === undefined || bValue === undefined) return 0;

      // Handle numeric values
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        const numA = Number(aValue);
        const numB = Number(bValue);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // Handle string values
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [players, activeTab, sortConfig]);

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const renderBattingTable = () => (
    <div className="table-container">
      <table className="stats-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
            <th onClick={() => handleSort('position')}>Pos {getSortIcon('position')}</th>
            <th onClick={() => handleSort('age')}>Age {getSortIcon('age')}</th>
            <th onClick={() => handleSort('avg')}>AVG {getSortIcon('avg')}</th>
            <th onClick={() => handleSort('obp')}>OBP {getSortIcon('obp')}</th>
            <th onClick={() => handleSort('slg')}>SLG {getSortIcon('slg')}</th>
            <th onClick={() => handleSort('ops')}>OPS {getSortIcon('ops')}</th>
            <th onClick={() => handleSort('hr')}>HR {getSortIcon('hr')}</th>
            <th onClick={() => handleSort('rbi')}>RBI {getSortIcon('rbi')}</th>
            <th onClick={() => handleSort('runs')}>R {getSortIcon('runs')}</th>
            <th onClick={() => handleSort('hits')}>H {getSortIcon('hits')}</th>
            <th onClick={() => handleSort('sb')}>SB {getSortIcon('sb')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers
            .filter(player => !['SP', 'RP', 'CP', 'P'].includes(player.position))
            .map(player => (
            <tr key={player.id}>
              <td className="player-name">{player.name}</td>
              <td>{player.position}</td>
              <td>{player.age}</td>
              <td>{player.avg || '--'}</td>
              <td>{player.obp || '--'}</td>
              <td>{player.slg || '--'}</td>
              <td>{player.ops || '--'}</td>
              <td>{player.hr || '--'}</td>
              <td>{player.rbi || '--'}</td>
              <td>{player.runs || '--'}</td>
              <td>{player.hits || '--'}</td>
              <td>{player.sb || '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPitchingTable = () => (
    <div className="table-container">
      <table className="stats-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
            <th onClick={() => handleSort('position')}>Pos {getSortIcon('position')}</th>
            <th onClick={() => handleSort('age')}>Age {getSortIcon('age')}</th>
            <th onClick={() => handleSort('era')}>ERA {getSortIcon('era')}</th>
            <th onClick={() => handleSort('whip')}>WHIP {getSortIcon('whip')}</th>
            <th onClick={() => handleSort('wins')}>W {getSortIcon('wins')}</th>
            <th onClick={() => handleSort('losses')}>L {getSortIcon('losses')}</th>
            <th onClick={() => handleSort('saves')}>SV {getSortIcon('saves')}</th>
            <th onClick={() => handleSort('ip')}>IP {getSortIcon('ip')}</th>
            <th onClick={() => handleSort('so_p')}>SO {getSortIcon('so_p')}</th>
            <th onClick={() => handleSort('bb_p')}>BB {getSortIcon('bb_p')}</th>
            <th onClick={() => handleSort('hr_p')}>HR {getSortIcon('hr_p')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers
            .filter(player => ['SP', 'RP', 'CP', 'P'].includes(player.position))
            .map(player => (
            <tr key={player.id}>
              <td className="player-name">{player.name}</td>
              <td>{player.position}</td>
              <td>{player.age}</td>
              <td>{player.era || '--'}</td>
              <td>{player.whip || '--'}</td>
              <td>{player.wins || '--'}</td>
              <td>{player.losses || '--'}</td>
              <td>{player.saves || '--'}</td>
              <td>{player.ip || '--'}</td>
              <td>{player.so_p || '--'}</td>
              <td>{player.bb_p || '--'}</td>
              <td>{player.hr_p || '--'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="player-stats-table-section">
      <h2>Complete Organization Stats</h2>
      
      <div className="level-tabs">
        {(['MLB', 'AAA'] as TeamLevel[]).map(level => (
          <button
            key={level}
            className={`level-tab ${activeTab === level ? 'active' : ''}`}
            onClick={() => handleTabChange(level)}
            disabled={loading[level]}
          >
            {level}
            {level === 'AAA' && ' (Tacoma)'}
            {loading[level] && ' ⟳'}
          </button>
        ))}
      </div>

      {loading[activeTab] && (
        <div className="loading-state">Loading {activeTab} roster and stats...</div>
      )}

      {errors[activeTab] && (
        <div className="error-message">
          ❌ Unable to load {activeTab} roster data
        </div>
      )}

      {!loading[activeTab] && !errors[activeTab] && players[activeTab].length > 0 && (
        <div className="tables-container">
          <div className="table-section">
            <h3>Batting Statistics</h3>
            {renderBattingTable()}
          </div>
          
          <div className="table-section">
            <h3>Pitching Statistics</h3>
            {renderPitchingTable()}
          </div>
        </div>
      )}

      {!loading[activeTab] && !errors[activeTab] && players[activeTab].length === 0 && (
        <div className="loading-state">No {activeTab} roster data available</div>
      )}
    </section>
  );
};

export default PlayerStatsTable;