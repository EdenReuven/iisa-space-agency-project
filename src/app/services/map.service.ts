import { Injectable } from '@angular/core';
import {} from '@angular/google-maps';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class MapService {
  private map!: google.maps.Map;
  private markers: google.maps.Marker[] = [];

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  async initMap(mapElement: HTMLElement) {
    await this.loadGoogleMaps();
    this.map = new google.maps.Map(mapElement, {
      center: { lat: 31.5, lng: 34.75 },
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    });
  }

  async geoCodeCity(cityName: string): Promise<{ lat: number; lng: number } | null> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocode failed for', cityName, status);
          resolve(null);
        }
      });
    });
  }
  getMap(): google.maps.Map {
    return this.map;
  }

  async addCityNames(cityNames: string[]): Promise<void> {
    this.markers = [];
    for (const city of cityNames) {
      const coords = await this.geoCodeCity(city);
      if (!coords) continue;

      const marker = new google.maps.Marker({
        position: coords,
        map: this.map,
        title: city,
      });
      this.markers.push(marker);
    }
  }
}
