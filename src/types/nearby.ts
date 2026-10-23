export type SupplyFilter = 'pads' | 'tampons' | 'cups' | 'pain_relief' | 'pregnancy_tests';

export interface NearbyPlace {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number; // metres
  type: string;
  phone?: string;
  address?: string;
}
