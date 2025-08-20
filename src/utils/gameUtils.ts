
export const parseGameScore = (scoreData: any): string => {
  if (typeof scoreData === 'object' && scoreData !== null) {
    return (scoreData?.value || scoreData?.displayValue || '0').toString();
  }
  return scoreData?.toString() || '0';
};

export const getTeamName = (team: any): string => {
  return team?.team?.displayName || 
         team?.team?.shortDisplayName || 
         team?.team?.name || 
         'Unknown Team';
};

export const determineGameResult = (
  awayTeamName: string, 
  homeTeamName: string, 
  awayScore: string, 
  homeScore: string
): 'win' | 'loss' => {
  const marinersWon = 
    (awayTeamName.includes('Mariners') && parseInt(awayScore) > parseInt(homeScore)) ||
    (homeTeamName.includes('Mariners') && parseInt(homeScore) > parseInt(awayScore));
  
  return marinersWon ? 'win' : 'loss';
};

export const filterCompletedGames = (games: any[]): any[] => {
  return games.filter((game: any) => {
    if (!game.competitions || !game.competitions[0]) {
      return false;
    }
    
    const competition = game.competitions[0];
    const isCompleted = competition.status?.type?.completed;
    const isPast = new Date(game.date) <= new Date();
    
    return isPast && isCompleted;
  });
};

export const filterUpcomingGames = (games: any[]): any[] => {
  return games.filter((game: any) => new Date(game.date) > new Date());
};