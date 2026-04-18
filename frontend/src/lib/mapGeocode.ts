const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export type GeocodePlace = { label: string; lat: number; lng: number };

export async function searchUsPlaces(query: string): Promise<GeocodePlace[]> {
  if (!MAPBOX_TOKEN.trim() || query.trim().length < 2) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim()
  )}.json?country=US&types=place&limit=8&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const feats = data.features || [];
  return feats.map((f: { place_name: string; center: [number, number] }) => ({
    label: f.place_name,
    lat: f.center[1],
    lng: f.center[0],
  }));
}
