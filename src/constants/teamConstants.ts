export const MARINERS_TEAM_IDS = {
  ESPN: 12,
  MLB: 136,
  AAA: 4406 // Tacoma Rainiers (PCL)
} as const;

export const API_ENDPOINTS = {
  ESPN: {
    TEAM: (teamId: number) => `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}`,
    SCHEDULE: (teamId: number) => `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}/schedule`,
    ROSTER: (teamId: number) => `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}/roster`,
    STATS: (teamId: number) => `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${teamId}/statistics`
  },
  MLB: {
    ROSTER: (teamId: number, season: number) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active&season=${season}`,
    PLAYER_STATS: (playerId: number, season: number) => `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=season&season=${season}&group=hitting,pitching`,
    AFFILIATES: (teamId: number, season: number) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/affiliates?season=${season}`
  }
} as const;

export type TeamLevel = 'MLB' | 'AAA';