export interface CacheItem {
  data: any;
  timestamp: number;
}

export class APICache {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  async makeAPICall(url: string, cacheKey: string): Promise<any> {
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }

  clear(): void {
    this.cache.clear();
  }
}