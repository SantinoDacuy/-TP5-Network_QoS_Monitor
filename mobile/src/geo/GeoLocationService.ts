import { GeoCoordinate } from '../core/types';

// Default reference coordinates (Buenos Aires Telecom Hub)
const DEFAULT_COORDS: GeoCoordinate = {
  latitude: -34.6037,
  longitude: -58.3816,
  accuracy: 12.0,
  altitude: 25.0,
  speed: 1.2,
  heading: 90
};

// Route simulator offset for demo sessions
let simStep = 0;

export class GeoLocationService {
  /**
   * Acquires current GPS position using browser Geolocation or native GPS
   */
  public static async getCurrentPosition(): Promise<GeoCoordinate> {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 10,
              altitude: pos.coords.altitude,
              speed: pos.coords.speed,
              heading: pos.coords.heading
            });
          },
          (err) => {
            console.warn('Geolocation error or permission denied, using simulated coordinate:', err.message);
            resolve(this.getSimulatedNextCoordinate());
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      });
    }

    return this.getSimulatedNextCoordinate();
  }

  /**
   * Generates a smooth, realistic walking/driving route coordinate for testing
   */
  public static getSimulatedNextCoordinate(center = DEFAULT_COORDS): GeoCoordinate {
    simStep++;
    // Walk along a path with slight random displacement
    const angle = (simStep * 0.15);
    const radius = 0.005 + (simStep * 0.0004);
    const latOffset = Math.sin(angle) * radius;
    const lngOffset = Math.cos(angle) * radius;

    return {
      latitude: center.latitude + latOffset,
      longitude: center.longitude + lngOffset,
      accuracy: 8.5 + (Math.random() * 4),
      altitude: 22 + Math.sin(simStep) * 5,
      speed: 1.5,
      heading: (angle * 180 / Math.PI) % 360
    };
  }

  /**
   * Resets simulation step
   */
  public static resetSimulation() {
    simStep = 0;
  }
}
