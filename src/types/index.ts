export interface ZipCodeLocation {
  id: number;
  country_code: string;
  postal_code: string;
  place_name: string;
  admin_name1: string;
  admin_code1: string;
  admin_name2: string;
  admin_code2: string;
  latitude: number;
  longitude: number;
}

export interface DistanceRequest {
  originZipCode: string;
  destinationZipCodes: string[];
  unit?: DistanceUnit;
}

export interface DistanceResult {
  zipCode: string;
  placeName: string;
  distance: number;
  unit: DistanceUnit;
  latitude: number;
  longitude: number;
}

export type DistanceUnit = 'km' | 'miles' | 'meters' | 'feet';

export interface DistanceResponse {
  origin: {
    zipCode: string;
    placeName: string;
    latitude: number;
    longitude: number;
  };
  destinations: DistanceResult[];
  warnings?: {
    notFound: string[];
  };
} 