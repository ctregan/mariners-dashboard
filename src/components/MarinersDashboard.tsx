import React, { useState, useEffect, useCallback } from 'react';
import TeamRecord from './TeamRecord';
import UpcomingGames from './UpcomingGames';
import RecentGames from './RecentGames';
import PlayerStats from './PlayerStats';
import PlayerStatsTable from './PlayerStatsTable';
import RefreshButton from './RefreshButton';
import { APICache } from '../utils/apiUtils';
import { MARINERS_TEAM_IDS, API_ENDPOINTS } from '../constants/teamConstants';
import { TeamRecord as TeamRecordType, Game } from '../types/playerTypes';
import { filterCompletedGames, filterUpcomingGames } from '../utils/gameUtils';
import './MarinersDashboard.css';

const MarinersDashboard: React.FC = () => {
  const [teamRecord, setTeamRecord] = useState<TeamRecordType>({ wins: '--', losses: '--', pct: '--' });
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    teamRecord: false,
    upcomingGames: false,
    recentGames: false,
    playerStats: false
  });
  const [apiCache] = useState(() => new APICache());

  const makeAPICall = useCallback(async (url: string, cacheKey: string) => {
    return apiCache.makeAPICall(url, cacheKey);
  }, [apiCache]);

  const loadTeamRecord = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, teamRecord: false }));
      
      // Use ESPN's current season API for Mariners
      const data = await makeAPICall(
        API_ENDPOINTS.ESPN.TEAM(MARINERS_TEAM_IDS.ESPN),
        'team-record'
      );

      if (data && data.team) {
        const record = data.team.record;
        if (record && record.items && record.items[0]) {
          const stats = record.items[0].stats;
          const wins = stats.find((s: any) => s.name === 'wins')?.value;
          const losses = stats.find((s: any) => s.name === 'losses')?.value;
          const winPct = stats.find((s: any) => s.name === 'winPercent')?.value;

          if (wins !== undefined && losses !== undefined && winPct !== undefined) {
            setTeamRecord({
              wins: wins.toString(),
              losses: losses.toString(),
              pct: typeof winPct === 'number' ? winPct.toFixed(3) : winPct.toString()
            });
            return;
          }
        }
      }
      
      // If we get here, the API didn't return expected data
      throw new Error('Invalid team record data received from API');
      
    } catch (error) {
      console.error('Error loading team record:', error);
      setErrors(prev => ({ ...prev, teamRecord: true }));
      setTeamRecord({ wins: '--', losses: '--', pct: '--' });
    }
  }, [makeAPICall]);

  const loadUpcomingGames = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, upcomingGames: false }));
      
      // Get current schedule data
      const data = await makeAPICall(
        API_ENDPOINTS.ESPN.SCHEDULE(MARINERS_TEAM_IDS.ESPN),
        'upcoming-games'
      );

      if (data && data.events) {
        const upcoming = filterUpcomingGames(data.events).slice(0, 5);

        setUpcomingGames(upcoming);
      } else {
        throw new Error('No schedule data available from API');
      }
    } catch (error) {
      console.error('Error loading upcoming games:', error);
      setErrors(prev => ({ ...prev, upcomingGames: true }));
      setUpcomingGames([]);
    }
  }, [makeAPICall]);

  const loadRecentGames = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, recentGames: false }));
      
      // Get current schedule data for recent games
      const data = await makeAPICall(
        API_ENDPOINTS.ESPN.SCHEDULE(MARINERS_TEAM_IDS.ESPN),
        'recent-games'
      );

      if (data && data.events) {
        const recent = filterCompletedGames(data.events)
          .slice(-5)
          .reverse();

        setRecentGames(recent);
      } else {
        throw new Error('No recent games data available from API');
      }
    } catch (error) {
      console.error('Error loading recent games:', error);
      setErrors(prev => ({ ...prev, recentGames: true }));
      setRecentGames([]);
    }
  }, [makeAPICall]);

  const loadPlayerStats = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, playerStats: false }));
      
      // Try MLB Statcast API for advanced stats (Baseball Savant)
      
      // Baseball Savant endpoints for team stats
      const currentYear = new Date().getFullYear();
      
      // Try getting team leaderboard data from Baseball Savant
      const statcastUrl = `https://baseballsavant.mlb.com/leaderboard/custom?year=${currentYear}&type=batter&filter=&sort=4&sortDir=desc&min=100&selections=xba,xslg,woba,xwoba,xobp,exit_velocity_avg,launch_angle_avg,barrel_batted_rate,&chart=false&x=xba&y=xslg&r=no&chartType=beeswarm&team=SEA`;
      
      try {
        // Try Statcast data first
        const statcastData = await makeAPICall(statcastUrl, 'statcast-data');
        
        if (statcastData) {
          // Process Statcast data if available
          setPlayerStats([]);
          return;
        }
      } catch (statcastError) {
        // Fall through to ESPN API fallback
      }
      
      // Fallback to ESPN API (keeping for future implementation)
      await makeAPICall(
        API_ENDPOINTS.ESPN.STATS(MARINERS_TEAM_IDS.ESPN),
        'espn-stats'
      );
      
      await makeAPICall(
        API_ENDPOINTS.ESPN.ROSTER(MARINERS_TEAM_IDS.ESPN),
        'roster-data'
      );
      
      // Try MLB Stats API for current stats
      try {
        // Get team roster first
        const rosterData = await makeAPICall(
          API_ENDPOINTS.MLB.ROSTER(MARINERS_TEAM_IDS.MLB, currentYear),
          'mlb-roster'
        );
        
        
        if (rosterData && rosterData.roster) {
          // Get some key players (batters and pitchers)
          const batters = rosterData.roster.filter((player: any) => 
            player.position.type === 'Hitter'
          ).slice(0, 2);
          
          const pitchers = rosterData.roster.filter((player: any) => 
            player.position.type === 'Pitcher'
          ).slice(0, 2);
          
          const keyPlayers = [...batters, ...pitchers];
          
          // Now get stats for each player
          const playersWithStats = await Promise.all(
            keyPlayers.map(async (player: any) => {
              try {
                const playerStatsData = await makeAPICall(
                  API_ENDPOINTS.MLB.PLAYER_STATS(player.person.id, currentYear),
                  `player-${player.person.id}-stats`
                );
                
                
                if (playerStatsData && playerStatsData.stats && playerStatsData.stats.length > 0) {
                  const stats = playerStatsData.stats[0].splits?.[0]?.stat;
                  
                  if (stats) {
                    const isPitcher = player.position.type === 'Pitcher';
                    
                    return {
                      name: player.person.fullName,
                      position: player.position.abbreviation,
                      ...(isPitcher ? {
                        era: stats.era || '0.00',
                        wins: stats.wins || '0',
                        so: stats.strikeOuts || '0'
                      } : {
                        avg: stats.avg || '.000',
                        hr: stats.homeRuns || '0',
                        rbi: stats.rbi || '0'
                      })
                    };
                  }
                }
                
                // Return player with placeholder stats if no data
                const isPitcher = player.position.type === 'Pitcher';
                return {
                  name: player.person.fullName,
                  position: player.position.abbreviation,
                  ...(isPitcher ? {
                    era: 'N/A',
                    wins: 'N/A',
                    so: 'N/A'
                  } : {
                    avg: 'N/A',
                    hr: 'N/A',
                    rbi: 'N/A'
                  })
                };
              } catch (playerError) {
                const isPitcher = player.position.type === 'Pitcher';
                return {
                  name: player.person.fullName,
                  position: player.position.abbreviation,
                  ...(isPitcher ? {
                    era: 'Error',
                    wins: 'Error',
                    so: 'Error'
                  } : {
                    avg: 'Error',
                    hr: 'Error',
                    rbi: 'Error'
                  })
                };
              }
            })
          );
          
          
          if (playersWithStats.length > 0) {
            setPlayerStats(playersWithStats);
            return;
          }
        }
      } catch (mlbError) {
        // MLB API failed, continue to error handling
      }
      
      // If all APIs fail, throw error
      throw new Error('No live player statistics available from any source');
      
    } catch (error) {
      console.error('Error loading player stats:', error);
      setErrors(prev => ({ ...prev, playerStats: true }));
      setPlayerStats([]);
    }
  }, [makeAPICall]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadTeamRecord(),
      loadUpcomingGames(),
      loadRecentGames(),
      loadPlayerStats()
    ]);
    setIsLoading(false);
  }, [loadTeamRecord, loadUpcomingGames, loadRecentGames, loadPlayerStats]);

  const handleRefresh = useCallback(async () => {
    apiCache.clear();
    await loadAllData();
  }, [apiCache, loadAllData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="team-logo">⚾</div>
        <h1>Seattle Mariners</h1>
        <p className="subtitle">Dashboard</p>
      </header>

      <main className="main-content">
        <TeamRecord 
          wins={teamRecord.wins}
          losses={teamRecord.losses}
          pct={teamRecord.pct}
          isLoading={isLoading}
          hasError={errors.teamRecord}
        />
        
        <UpcomingGames 
          games={upcomingGames}
          isLoading={isLoading}
          hasError={errors.upcomingGames}
        />
        
        <RecentGames 
          games={recentGames}
          isLoading={isLoading}
          hasError={errors.recentGames}
        />
        
        <PlayerStats 
          players={playerStats}
          isLoading={isLoading}
          hasError={errors.playerStats}
        />

        <PlayerStatsTable 
          isLoading={isLoading}
          hasError={false}
        />
      </main>

      <RefreshButton onRefresh={handleRefresh} />
    </div>
  );
};

export default MarinersDashboard;