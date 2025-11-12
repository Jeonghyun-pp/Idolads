import { MapProvider } from './provider';

export class MapboxProvider implements MapProvider {
  private token: string;

  constructor() {
    this.token = process.env.MAPBOX_TOKEN || '';
    if (!this.token) {
      console.warn('MAPBOX_TOKEN is not configured. Map features will be limited.');
    }
  }

  getMapboxToken(): string | undefined {
    return this.token || undefined;
  }

  isMock(): boolean {
    return false;
  }
}

