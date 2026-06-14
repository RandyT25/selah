"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Navigation, Star, Church, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { PlaceInitialData } from "./CreateChurchModal";

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
  rating?: number;
  user_ratings_total?: number;
  open_now?: boolean;
  distance_km: number;
  selah_id?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPlace?: (data: PlaceInitialData) => void;
}

function loadGooglePlaces(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) { resolve(); return; }
    const existing = document.querySelector('script[data-google-places]');
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.dataset.googlePlaces = "1";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function extractCity(vicinity: string): string {
  const parts = vicinity.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : vicinity.trim();
}

export function NearbyPlacesPanel({ open, onClose, onAddPlace }: Props) {
  type Status = "idle" | "locating" | "searching" | "done" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const attrDivRef = useRef<HTMLDivElement>(null);
  // map: google_place_id → selah church id
  const selahIds = useRef<Map<string, string>>(new Map());

  const getService = useCallback(() => {
    if (!serviceRef.current && attrDivRef.current && window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.PlacesService(attrDivRef.current);
    }
    return serviceRef.current;
  }, []);

  const searchNearby = useCallback(async (loc: { lat: number; lng: number }) => {
    setStatus("searching");
    setError(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) await loadGooglePlaces(apiKey);

    // Fetch our churches to cross-reference by google_place_id
    try {
      const res = await fetch("/api/churches");
      const { data } = await res.json();
      selahIds.current = new Map(
        (data ?? [])
          .filter((c: { google_place_id?: string }) => c.google_place_id)
          .map((c: { google_place_id: string; id: string }) => [c.google_place_id, c.id])
      );
    } catch { /* non-fatal */ }

    const service = getService();
    if (!service) {
      setError("Google Maps failed to load. Please refresh and try again.");
      setStatus("error");
      return;
    }

    service.nearbySearch(
      { location: new google.maps.LatLng(loc.lat, loc.lng), radius: 5000, type: "church" },
      (placeResults, searchStatus) => {
        if (searchStatus !== google.maps.places.PlacesServiceStatus.OK || !placeResults?.length) {
          setError("No churches found within 5 km. Try searching by name instead.");
          setStatus("error");
          return;
        }
        const mapped: PlaceResult[] = placeResults
          .map((p) => ({
            place_id: p.place_id!,
            name: p.name!,
            vicinity: p.vicinity ?? "",
            lat: p.geometry!.location!.lat(),
            lng: p.geometry!.location!.lng(),
            rating: p.rating,
            user_ratings_total: p.user_ratings_total,
            open_now: p.opening_hours?.open_now,
            distance_km: haversineKm(loc.lat, loc.lng, p.geometry!.location!.lat(), p.geometry!.location!.lng()),
            selah_id: selahIds.current.get(p.place_id!) ?? undefined,
          }))
          .sort((a, b) => a.distance_km - b.distance_km);
        setResults(mapped);
        setStatus("done");
      }
    );
  }, [getService]);

  const requestLocation = useCallback(() => {
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        searchNearby(loc);
      },
      (err) => {
        setError(
          err.code === 1
            ? "blocked"
            : "Could not get your location. Please try again."
        );
        setStatus("error");
      },
      { timeout: 10000 }
    );
  }, [searchNearby]);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setResults([]);
      setError(null);
      setUserLoc(null);
      setLoadingId(null);
    }
  }, [open]);

  const handleAdd = async (place: PlaceResult) => {
    if (!onAddPlace) return;
    setLoadingId(place.place_id);
    try {
      const service = getService();
      if (!service) {
        onAddPlace({
          google_place_id: place.place_id,
          name: place.name,
          address: place.vicinity,
          city: extractCity(place.vicinity),
          latitude: place.lat,
          longitude: place.lng,
        });
        return;
      }
      await new Promise<void>((resolve) => {
        service.getDetails(
          { placeId: place.place_id, fields: ["address_components", "formatted_address", "website"] },
          (detail, detailStatus) => {
            if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
              const comps = detail.address_components ?? [];
              const city =
                comps.find((c) => c.types.includes("locality"))?.long_name ??
                comps.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ??
                extractCity(place.vicinity);
              const province = comps.find((c) => c.types.includes("administrative_area_level_1"))?.long_name;
              onAddPlace({
                google_place_id: place.place_id,
                name: place.name,
                address: detail.formatted_address ?? place.vicinity,
                city,
                province,
                latitude: place.lat,
                longitude: place.lng,
                website: detail.website,
              });
            } else {
              onAddPlace({
                google_place_id: place.place_id,
                name: place.name,
                address: place.vicinity,
                city: extractCity(place.vicinity),
                latitude: place.lat,
                longitude: place.lng,
              });
            }
            resolve();
          }
        );
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm max-h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Nearby Churches on Google Maps
          </DialogTitle>
          {userLoc && status === "done" && (
            <p className="text-xs text-muted-foreground">Showing within 5 km of your location</p>
          )}
        </DialogHeader>

        {/* Hidden attribution container required by PlacesService */}
        <div ref={attrDivRef} className="hidden" />

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {status === "idle" && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Find churches near you</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                  Tap below to search for churches within 5 km of your location.
                </p>
              </div>
              <Button onClick={requestLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                Use my location
              </Button>
            </div>
          )}

          {status === "locating" && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Detecting your location…</p>
            </div>
          )}

          {status === "searching" && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching for churches nearby…</p>
            </div>
          )}

          {status === "error" && (
            <div className="py-8 text-center space-y-3">
              <Church className="h-10 w-10 mx-auto text-muted-foreground" />
              {error === "blocked" ? (
                <>
                  <p className="text-sm font-medium">Location access is blocked</p>
                  <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                    Your browser has blocked location for this site. To fix it:
                    <br /><strong>Chrome</strong> — tap the lock icon in the address bar → Site settings → Location → Allow.
                    <br /><strong>Safari</strong> — Settings → Safari → Location → Allow.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={requestLocation}>
                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                    Try again
                  </Button>
                </>
              )}
            </div>
          )}

          {status === "done" && results.length === 0 && (
            <div className="py-10 text-center">
              <Church className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No churches found within 5 km.</p>
            </div>
          )}

          {status === "done" && results.map((place) => (
            <div key={place.place_id} className="rounded-xl border bg-card p-3 space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Church className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm leading-tight">{place.name}</p>
                    {place.selah_id && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium px-1.5 py-0.5 rounded-full shrink-0">
                        In Selah
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{place.vicinity}</p>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {fmtDist(place.distance_km)}
                    </span>
                    {place.rating !== undefined && (
                      <span className="text-[11px] text-amber-600 flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {place.rating.toFixed(1)}
                        {place.user_ratings_total !== undefined && (
                          <span className="text-muted-foreground ml-0.5">({place.user_ratings_total})</span>
                        )}
                      </span>
                    )}
                    {place.open_now !== undefined && (
                      <span className={`text-[11px] font-medium ${place.open_now ? "text-green-600" : "text-red-500"}`}>
                        {place.open_now ? "Open now" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {place.selah_id ? (
                  <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5" asChild>
                    <Link href={`/bibleapp/community/churches/${place.selah_id}`} onClick={onClose}>
                      <ExternalLink className="h-3 w-3" />
                      View in Selah
                    </Link>
                  </Button>
                ) : onAddPlace ? (
                  <Button
                    size="sm"
                    variant="gold"
                    className="flex-1 text-xs gap-1.5"
                    disabled={loadingId === place.place_id}
                    onClick={() => handleAdd(place)}
                  >
                    {loadingId === place.place_id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Plus className="h-3 w-3" />
                    }
                    Add to Selah
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sign in to add this church</p>
                )}
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Google Maps"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
