import { parseGameScore, getTeamName, determineGameResult } from '../gameUtils';

describe('gameUtils', () => {
  describe('parseGameScore', () => {
    it('should parse object score data', () => {
      const scoreObject = { value: 5 };
      expect(parseGameScore(scoreObject)).toBe('5');
    });

    it('should parse object with displayValue', () => {
      const scoreObject = { displayValue: '7' };
      expect(parseGameScore(scoreObject)).toBe('7');
    });

    it('should handle primitive scores', () => {
      expect(parseGameScore(3)).toBe('3');
      expect(parseGameScore('4')).toBe('4');
    });

    it('should default to 0 for null/undefined', () => {
      expect(parseGameScore(null)).toBe('0');
      expect(parseGameScore(undefined)).toBe('0');
    });
  });

  describe('getTeamName', () => {
    it('should extract team display name', () => {
      const team = { team: { displayName: 'Seattle Mariners' } };
      expect(getTeamName(team)).toBe('Seattle Mariners');
    });

    it('should fallback to shortDisplayName', () => {
      const team = { team: { shortDisplayName: 'SEA' } };
      expect(getTeamName(team)).toBe('SEA');
    });

    it('should return Unknown Team for invalid data', () => {
      expect(getTeamName(null)).toBe('Unknown Team');
      expect(getTeamName({})).toBe('Unknown Team');
    });
  });

  describe('determineGameResult', () => {
    it('should determine Mariners win as away team', () => {
      const result = determineGameResult('Seattle Mariners', 'Boston Red Sox', '5', '3');
      expect(result).toBe('win');
    });

    it('should determine Mariners win as home team', () => {
      const result = determineGameResult('Boston Red Sox', 'Seattle Mariners', '3', '5');
      expect(result).toBe('win');
    });

    it('should determine Mariners loss', () => {
      const result = determineGameResult('Seattle Mariners', 'Boston Red Sox', '3', '5');
      expect(result).toBe('loss');
    });
  });
});