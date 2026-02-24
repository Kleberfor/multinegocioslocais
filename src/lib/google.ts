// Google Places API Integration
// S-2.1: Integração com Google Places API

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: number;
  photosDisplay?: string; // "10+" quando há 10 fotos (limite da API)
  types?: string[];
  businessStatus?: string;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  website?: string;
  phoneNumber?: string;
  priceLevel?: number;
}

export interface PlaceDetails extends PlaceResult {
  photosDisplay?: string;
  reviews?: {
    rating: number;
    text: string;
    time: number;
    authorName: string;
  }[];
  url?: string; // Google Maps URL
}

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Busca negócios pelo nome/query
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY não configurada");
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("region", "br");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.error("Google Places API error:", data);
    throw new Error(`Erro na busca: ${data.status}`);
  }

  return (data.results || []).map((place: any) => {
    const photosCount = place.photos?.length || 0;
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      photos: photosCount,
      // A API do Google retorna no máximo 10 fotos, então 10 significa "10 ou mais"
      photosDisplay: photosCount >= 10 ? "10+" : String(photosCount),
      types: place.types,
      businessStatus: place.business_status,
      openingHours: place.opening_hours,
    };
  });
}

/**
 * Busca detalhes completos de um negócio
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY não configurada");
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set(
    "fields",
    [
      "place_id",
      "name",
      "formatted_address",
      "rating",
      "user_ratings_total",
      "photos",
      "types",
      "business_status",
      "opening_hours",
      "website",
      "formatted_phone_number",
      "price_level",
      "reviews",
      "url",
    ].join(",")
  );

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK") {
    console.error("Google Places API error:", data);
    return null;
  }

  const place = data.result;
  const photosCount = place.photos?.length || 0;

  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    photos: photosCount,
    // A API do Google retorna no máximo 10 fotos, então 10 significa "10 ou mais"
    photosDisplay: photosCount >= 10 ? "10+" : String(photosCount),
    types: place.types,
    businessStatus: place.business_status,
    openingHours: place.opening_hours
      ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text,
        }
      : undefined,
    website: place.website,
    phoneNumber: place.formatted_phone_number,
    priceLevel: place.price_level,
    reviews: place.reviews?.map((review: any) => ({
      rating: review.rating,
      text: review.text,
      time: review.time,
      authorName: review.author_name,
    })),
    url: place.url,
  };
}
