
'use server';

/**
 * @fileOverview Service for interacting with external APIs,
 * e.g., Health.gov or other provider databases.
 */

import { allHealthcareCentres, HealthcareCentre } from '../data/healthcare-centres';

// --- Health.gov API Configuration ---
// TODO: Move this to an environment variable e.g., process.env.NEXT_PUBLIC_HEALTH_GOV_BASE_URL
const HEALTH_GOV_API_BASE_URL = 'https://health.gov/myhealthfinder/api/v3';

// --- BetterDoctor API Configuration ---
const BETTER_DOCTOR_API_BASE_URL = process.env.NEXT_PUBLIC_BETTER_DOCTOR_BASE_URL;
const BETTER_DOCTOR_USER_KEY = process.env.BETTER_DOCTOR_USER_KEY;


export interface Clinic {
  id: string;
  name: string;
  address: string;
  services: string[];
  acceptsWalkIn: boolean;
  distanceKm?: number;
}

interface FetchClinicsInput {
  latitude: number;
  longitude: number;
  maxDistanceKm?: number;
  insuranceAccepted?: string;
  languageSpoken?: string;
}

// Add static Federal Medical Centres for AI matching
const FEDERAL_MEDICAL_CENTRES: Clinic[] = [
  { id: 'fmc-abeokuta', name: 'Federal Medical Centre, Abeokuta, Ogun State', address: 'Abeokuta, Ogun State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-asaba', name: 'Federal Medical Centre, Asaba, Delta State', address: 'Asaba, Delta State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-azare', name: 'Federal Medical Centre, Azare, Bauchi State', address: 'Azare, Bauchi State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-bida', name: 'Federal Medical Centre, Bida, Niger State', address: 'Bida, Niger State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-birnin-kudu', name: 'Federal Medical Centre, Birnin Kudu, Jigawa State', address: 'Birnin Kudu, Jigawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-ebute-metta', name: 'Federal Medical Centre, Ebute Metta, Lagos State', address: 'Ebute Metta, Lagos State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-epe', name: 'Federal Medical Centre, Epe, Lagos State', address: 'Epe, Lagos State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-daura', name: 'Federal Medical Centre, Daura, Katsina State', address: 'Daura, Katsina State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-gusau', name: 'Federal Medical Centre, Gusau, Zamfara State', address: 'Gusau, Zamfara State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-hong', name: 'Federal Medical Centre, Hong, Adamawa State', address: 'Hong, Adamawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-ikole-ekiti', name: 'Federal Medical Centre, Ikole-Ekiti, Ekiti State', address: 'Ikole-Ekiti, Ekiti State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-jabi', name: 'Federal Medical Centre, Jabi - Abuja, FCT', address: 'Jabi, Abuja, FCT', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-jalingo', name: 'Federal Medical Centre, Jalingo, Taraba State', address: 'Jalingo, Taraba State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-keffi', name: 'Federal Medical Centre, Keffi, Nasarawa State', address: 'Keffi, Nasarawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-makurdi', name: 'Federal Medical Centre, Makurdi, Benue State', address: 'Makurdi, Benue State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-misau', name: 'Federal Medical Centre, Misau, Bauchi State', address: 'Misau, Bauchi State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-mubi', name: 'Federal Medical Centre, Mubi, Adamawa State', address: 'Mubi, Adamawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-new-bussa', name: 'Federal Medical Centre, New Bussa, Niger State', address: 'New Bussa, Niger State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-nguru', name: 'Federal Medical Centre, Nguru, Yobe State', address: 'Nguru, Yobe State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-onitsha', name: 'Federal Medical Centre, Onitsha, Anambra State', address: 'Onitsha, Anambra State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-owo', name: 'Federal Medical Centre, Owo, Ondo State', address: 'Owo, Ondo State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-umuahia', name: 'Federal Medical Centre, Umuahia, Abia State', address: 'Umuahia, Abia State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-wase', name: 'Federal Medical Centre, Wase, Plateau State', address: 'Wase, Plateau State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
  { id: 'fmc-yenagoa', name: 'Federal Medical Centre, Yenagoa, Bayelsa State', address: 'Yenagoa, Bayelsa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true },
];

/**
 * Fetches a list of nearby clinics based on provided criteria.
 * This is a placeholder and would need to be connected to a real API
 * (e.g., using BetterDoctor's provider search, not implemented here yet).
 * @param input Criteria for fetching clinics.
 * @returns A promise that resolves to an array of Clinic objects.
 */
export async function fetchNearbyClinics(input: FetchClinicsInput): Promise<Clinic[]> {
  // Using a placeholder API for demonstration. Replace with your actual API endpoint.
  const apiUrl = `https://jsonplaceholder.typicode.com/users?_limit=5`;

  console.log(`Fetching clinics from: ${apiUrl} with input:`, input);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error (fetchNearbyClinics): ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch clinics: ${response.status} ${response.statusText}. Details: ${errorBody}`);
    }
    const data = await response.json();
    const clinics: Clinic[] = data.map((user: any, index: number) => ({
      id: user.id.toString(),
      name: user.name,
      address: `${user.address.street}, ${user.address.city}`,
      services: ['General Checkup', 'Vaccinations'],
      acceptsWalkIn: index % 2 === 0,
      distanceKm: parseFloat((Math.random() * 5 + 0.5).toFixed(1)),
    }));

    // Add Federal Medical Centres to the results
    const allClinics = [
      ...clinics,
      ...FEDERAL_MEDICAL_CENTRES.map((fmc) => ({ ...fmc, distanceKm: Math.random() * 20 + 1 })), // Simulate distance
    ];

    console.log("Fetched and parsed clinics (with FMCs):", allClinics);
    return allClinics;

  } catch (error) {
    console.error('Error in fetchNearbyClinics:', error);
    if (error instanceof Error) {
      throw new Error(`Could not retrieve clinic data: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching clinic data.');
  }
}

// --- Health.gov API Functions ---

/**
 * Generic helper function to make GET requests to the Health.gov API.
 * @param endpoint The API endpoint path (e.g., "topicsearch.json").
 * @param params Optional query parameters as an object.
 * @returns A promise that resolves to the parsed JSON response.
 */
async function fetchHealthGovApi<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${HEALTH_GOV_API_BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }

  console.log(`Fetching from Health.gov API: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Health.gov API Error (${endpoint}): ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch from ${endpoint}: ${response.status} ${response.statusText}. Details: ${errorBody}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error in fetchHealthGovApi for endpoint ${endpoint}:`, error);
    if (error instanceof Error) {
      throw new Error(`Could not retrieve data from ${endpoint}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching data from ${endpoint}.`);
  }
}

export interface TopicSearchResult {
  Title: string;
  Id: string;
  AccessibleVersion: string;
  Categories: string;
}
export interface TopicSearchResponse {
  Result: {
    Resources: {
      Resource: TopicSearchResult[];
    };
    Total: number;
    Error: string | null;
  }
}

export async function searchHealthTopics(keyword: string): Promise<TopicSearchResponse> {
  return fetchHealthGovApi<TopicSearchResponse>('topicsearch.json', { keyword });
}


export interface MyHealthfinderResult {
  Id: string;
  Title: string;
  AccessibleVersion?: string; // Made optional for consistency
}
export interface MyHealthfinderResponse {
   Result: {
    Resources: {
      Resource: MyHealthfinderResult[];
    };
    Total: number;
    Error: string | null;
  }
}

export async function getMyHealthfinderData(params?: {
  age?: number;
  sex?: string;
  [key: string]: string | number | undefined;
}): Promise<MyHealthfinderResponse> {
  return fetchHealthGovApi<MyHealthfinderResponse>('myhealthfinder.json', params as Record<string, string | number> | undefined);
}


export interface HealthItem {
  Id: string;
  Title: string;
}
export interface ItemListResponse {
   Result: {
    Items: {
      Item: HealthItem[];
    };
    Total: number;
    Error: string | null;
  }
}
export async function getHealthItemsList(params?: Record<string, string>): Promise<ItemListResponse> {
  return fetchHealthGovApi<ItemListResponse>('itemlist.json', params);
}

// --- BetterDoctor API Functions ---

interface BetterDoctorApiParams {
  fields?: string;
  skip?: number;
  limit?: number;
  [key: string]: string | number | undefined; // Allow other specific params
}

/**
 * Generic helper function to make GET requests to the BetterDoctor API.
 * @param endpoint The API endpoint path (e.g., "conditions").
 * @param params Optional query parameters as an object.
 * @returns A promise that resolves to the parsed JSON response.
 */
async function fetchBetterDoctorApi<T>(endpoint: string, params?: BetterDoctorApiParams): Promise<T> {
  if (!BETTER_DOCTOR_API_BASE_URL || !BETTER_DOCTOR_USER_KEY) {
    const errorMessage = "BetterDoctor API Base URL or User Key is not configured in environment variables.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const url = new URL(`${BETTER_DOCTOR_API_BASE_URL}/${endpoint}`);
  url.searchParams.append('user_key', BETTER_DOCTOR_USER_KEY);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  console.log(`Fetching from BetterDoctor API: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`BetterDoctor API Error (${endpoint}): ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch from BetterDoctor ${endpoint}: ${response.status} ${response.statusText}. Details: ${errorBody}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error in fetchBetterDoctorApi for endpoint ${endpoint}:`, error);
    if (error instanceof Error) {
      throw new Error(`Could not retrieve data from BetterDoctor ${endpoint}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching data from BetterDoctor ${endpoint}.`);
  }
}

// Placeholder interfaces for BetterDoctor responses - adjust based on actual API docs
interface BetterDoctorMeta {
  data_type: string;
  item_type: string;
  total: number;
  count: number;
  skip: number;
  limit: number;
}

export interface BetterDoctorCondition {
  uid: string;
  name: string;
  // ... other fields as per API documentation and 'fields' parameter
}
export interface BetterDoctorConditionsResponse {
  meta: BetterDoctorMeta;
  data: BetterDoctorCondition[];
}

export interface BetterDoctorSpecialty {
  uid: string;
  name: string;
  category: string;
  // ... other fields
}
export interface BetterDoctorSpecialtiesResponse {
  meta: BetterDoctorMeta;
  data: BetterDoctorSpecialty[];
}

export interface BetterDoctorInsuranceProvider {
  uid: string;
  name: string;
  // ... other fields
}
export interface BetterDoctorInsurancePlan {
  uid: string;
  name: string;
  // ... other fields
}
export interface BetterDoctorInsurancesResponse {
  meta: BetterDoctorMeta;
  data: { // Structure might vary, e.g. separate providers and plans
    providers: BetterDoctorInsuranceProvider[];
    plans: BetterDoctorInsurancePlan[];
  } | any[]; // Adjust based on actual API
}

export interface BetterDoctorApiInfo {
  // Define based on the actual API response for /info
  api_version: string;
  status: string;
  // ... other fields
}

/**
 * Retrieves a list of known conditions from BetterDoctor.
 * Corresponds to GET /conditions
 */
export async function getBetterDoctorConditions(params?: BetterDoctorApiParams): Promise<BetterDoctorConditionsResponse> {
  return fetchBetterDoctorApi<BetterDoctorConditionsResponse>('conditions', params);
}

/**
 * Retrieves a list of all specialties from BetterDoctor.
 * Corresponds to GET /specialties
 */
export async function getBetterDoctorSpecialties(params?: BetterDoctorApiParams): Promise<BetterDoctorSpecialtiesResponse> {
  return fetchBetterDoctorApi<BetterDoctorSpecialtiesResponse>('specialties', params);
}

/**
 * Retrieves insurance providers and plans from BetterDoctor.
 * Corresponds to GET /insurances
 */
export async function getBetterDoctorInsurances(params?: BetterDoctorApiParams): Promise<BetterDoctorInsurancesResponse> {
  return fetchBetterDoctorApi<BetterDoctorInsurancesResponse>('insurances', params);
}

/**
 * Performs an API Health Check for BetterDoctor.
 * Corresponds to GET /info
 */
export async function getBetterDoctorApiHealth(): Promise<BetterDoctorApiInfo> {
  return fetchBetterDoctorApi<BetterDoctorApiInfo>('info');
}

/**
 * Search all healthcare centres and practitioners by name, address, or facilityType.
 * @param query The search string (e.g., user input or location)
 * @returns Array of matching HealthcareCentre objects
 */
export async function searchHealthcareCentres(query: string): Promise<HealthcareCentre[]> {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  return allHealthcareCentres.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.address.toLowerCase().includes(q) ||
    (c.facilityType && c.facilityType.toLowerCase().includes(q))
  );
}
