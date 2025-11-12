import { MapProvider } from './provider';

/**
 * Mock Map Provider for Local Development
 * Returns undefined for token, which allows components to show fallback UI
 */
export class MockMapProvider implements MapProvider {
  getMapboxToken(): undefined {
    return undefined;
  }

  isMock(): boolean {
    return true;
  }
}

