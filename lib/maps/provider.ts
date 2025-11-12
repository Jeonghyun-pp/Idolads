export interface MapProvider {
  getMapboxToken?(): string | undefined;
  isMock(): boolean;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

// Provider factory
export async function getMapProvider(): Promise<MapProvider> {
  const provider = process.env.MAP_PROVIDER || 'mock';

  switch (provider) {
    case 'mapbox':
      const { MapboxProvider } = await import('./mapbox');
      return new MapboxProvider();
    case 'mock':
    default:
      const { MockMapProvider } = await import('./mock');
      return new MockMapProvider();
  }
}

