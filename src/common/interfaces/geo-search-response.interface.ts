export interface GeoSearchResponse {
	id: string;
	name: string;
	lon: number;
	lat: number;
	type?: string;
	display_name?: string;
	country?: string;
	city?: string;
	display_type: string;
}

export interface BaseLocation {
	id: string;
	name: string;
	lat: number;
	lon: number;
	type: string;
}

export interface GeoLocation extends BaseLocation {
	country: string;
	city?: string;
	display_name: string;
	display_type: string;
}

export interface PointOfInterest extends BaseLocation {
	category: string;
	distance?: number;
	rating?: number;
	address?: string;
}

export interface CombinedSearchResult {
	geoRegionContent?: GeoLocation[];
	landmarkContent?: PointOfInterest[];
}
