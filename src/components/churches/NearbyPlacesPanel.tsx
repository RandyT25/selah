"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Star, Church, Plus, ExternalLink, Search, Navigation } from "lucide-react";
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
  distance_km?: number;
  selah_id?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPlace?: (data: PlaceInitialData) => void;
}

function loadGooglePlaces(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) { resolve(); return; }
    const existing = document.querySelector('script[data-google-places]');
    if (existing) {
      if (window.google?.maps?.places) { resolve(); return; }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.dataset.googlePlaces = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
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
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function extractCity(vicinity: string): string {
  const parts = vicinity.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : vicinity.trim();
}

export function NearbyPlacesPanel({ open, onClose, onAddPlace }: Props) {
  type Status = "loading" | "results" | "empty" | "error";
  const [status, setStatus] = useState<Status>("loading");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [usingLocation, setUsingLocation] = useState(false);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const attrDivRef = useRef<HTMLDivElement>(null);
  const selahIds = useRef<Map<string, string>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  const getService = useCallback(() => {
    if (!serviceRef.current && attrDivRef.current && window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.PlacesService(attrDivRef.current);
    }
    return serviceRef.current;
  }, []);

  const loadSelahIds = useCallback(async () => {
    try {
      const res = await fetch("/api/churches");
      const { data } = await res.json();
      selahIds.current = new Map(
        (data ?? [])
          .filter((c: { google_place_id?: string }) => c.google_place_id)
          .map((c: { google_place_id: string; id: string }) => [c.google_place_id, c.id])
      );
    } catch { /* non-fatal */ }
  }, []);

  const showResults = useCallback((
    placeResults: google.maps.places.PlaceResult[],
    userLoc?: { lat: number; lng: number }
  ) => {
    const mapped: PlaceResult[] = placeResults
      .filter(p => p.place_id && p.name && p.geometry?.location)
      .map((p) => ({
        place_id: p.place_id!,
        name: p.name!,
        vicinity: p.vicinity ?? p.formatted_address ?? "",
        lat: p.geometry!.location!.lat(),
        lng: p.geometry!.location!.lng(),
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        distance_km: userLoc
          ? haversineKm(userLoc.lat, userLoc.lng, p.geometry!.location!.lat(), p.geometry!.location!.lng())
          : undefined,
        selah_id: selahIds.current.get(p.place_id!) ?? undefined,
      }))
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

    if (mapped.length === 0) setStatus("empty");
    else { setResults(mapped); setStatus("results"); }
  }, []);

  const tryGeolocation = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setStatus("error"); return; }
    try { await loadGooglePlaces(apiKey); } catch { setStatus("error"); return; }
    await loadSelahIds();
    if (!navigator.geolocation) { setStatus("error"); return; }
    setUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUsingLocation(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const service = getService();
        if (!service) { setStatus("error"); return; }
        service.nearbySearch(
          { location: new google.maps.LatLng(loc.lat, loc.lng), radius: 5000, type: "church" },
          (res, st) => {
            if (st === google.maps.places.PlacesServiceStatus.OK && res?.length) showResults(res, loc);
            else setStatus("error");
          }
        );
      },
      () => { setUsingLocation(false); setStatus("error"); },
      { timeout: 6000, maximumAge: 300000, enableHighAccuracy: false }
    );
  }, [getService, loadSelahIds, showResults]);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    setSearching(true);
    setResults([]);
    try {
      await loadGooglePlaces(apiKey);
      await loadSelahIds();
      const service = getService();
      if (!service) { setSearching(false); return; }
      service.textSearch(
        { query: `church ${q}` },
        (res, st) => {
          setSearching(false);
          if (st === google.maps.places.PlacesServiceStatus.OK && res?.length) showResults(res);
          else setStatus("empty");
        }
      );
    } catch { setSearching(false); }
  }, [query, getService, loadSelahIds, showResults]);

  useEffect(() => {
    if (open) {
      setStatus("loading");
      setResults([]);
      setQuery("");
      setUsingLocation(false);
      tryGeolocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) { serviceRef.current = null; setLoadingId(null); }
  }, [open]);

  useEffect(() => {
    if (status === "error") setTimeout(() => inputRef.current?.focus(), 150);
  }, [status]);

  const handleAdd = async (place: PlaceResult) => {
    if (!onAddPlace) return;
    setLoadingId(place.place_id);
    try {
      const service = getService();
      if (!service) {
        onAddPlace({ google_place_id: place.place_id, name: place.name, address: place.vicinity, city: extractCity(place.vicinity), latitude: place.lat, longitude: place.lng });
        return;
      }
      await new Promise<void>((resolve) => {
        service.getDetails(
          { placeId: place.place_id, fields: ["address_components", "formatted_address", "website"] },
          (detail, detailStatus) => {
            if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
              const comps = detail.address_components ?? [];
              const city = comps.find((c) => c.types.includes("locality"))?.long_name ?? comps.find((c) => c.types.includes("administrative_area_level_2"))?.long_name ?? extractCity(place.vicinity);
              const province = comps.find((c) => c.types.includes("administrative_area_level_1"))?.long_name;
              onAddPlace({ google_place_id: place.place_id, name: place.name, address: detail.formatted_address ?? place.vicinity, city, province, latitude: place.lat, longitude: place.lng, website: detail.website });
            } else {
              onAddPlace({ google_place_id: place.place_id, name: place.name, address: place.vicinity, city: extractCity(place.vicinity), latitude: place.lat, longitude: place.lng });
            }
            resolve();
          }
        );
      });
    } finally { setLoadingId(null); }
  };

  return (
    <Drawer.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed left-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-full overflow-x-hidden rounded-t-2xl border-t bg-background focus:outline-none max-h-[85dvh]">

          {/* Drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b shrink-0">
            <Drawer.Title className="flex items-center gap-2 font-semibold text-base">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              Find Churches
            </Drawer.Title>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div ref={attrDivRef} className="hidden" />

          {/* Search bar — always visible */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <form onSubmit={handleSearch} className="flex gap-2 min-w-0">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city or area…"
                className="h-10 text-base min-w-0"
              />
              <Button
                type="submit"
                size="sm"
                disabled={searching || !query.trim()}
                className="h-10 w-10 px-0 shrink-0 flex-none"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Scrollable results */}
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">

            {status === "loading" && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {usingLocation ? "Finding churches near you…" : "Loading…"}
                </p>
                {usingLocation && (
                  <p className="text-xs text-muted-foreground/60">Allow location if prompted</p>
                )}
              </div>
            )}

            {status === "empty" && (
              <div className="py-10 text-center">
                <Church className="h-9 w-9 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No churches found.</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different city or area name.</p>
              </div>
            )}

            {status === "error" && results.length === 0 && (
              <div className="py-10 text-center space-y-1.5">
                <Navigation className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Search for churches</p>
                <p className="text-xs text-muted-foreground">
                  Type your city or area in the search bar above.
                </p>
              </div>
            )}

            {results.map((place) => (
              <div key={place.place_id} className="rounded-xl border bg-card p-3.5 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Church className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm leading-tight break-words">{place.name}</p>
                      {place.selah_id && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium px-1.5 py-0.5 rounded-full shrink-0">
                          In Selah
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{place.vicinity}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {place.distance_km !== undefined && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />{fmtDist(place.distance_km)}
                        </span>
                      )}
                      {place.rating !== undefined && (
                        <span className="text-[11px] text-amber-600 flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {place.rating.toFixed(1)}
                          {place.user_ratings_total !== undefined && (
                            <span className="text-muted-foreground ml-0.5">({place.user_ratings_total})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {place.selah_id ? (
                    <Button size="sm" variant="outline" className="flex-1 text-xs gap-1.5 h-9" asChild>
                      <Link href={`/bibleapp/community/churches/${place.selah_id}`} onClick={onClose}>
                        <ExternalLink className="h-3 w-3" />
                        View in Selah
                      </Link>
                    </Button>
                  ) : onAddPlace ? (
                    <Button
                      size="sm" variant="gold"
                      className="flex-1 text-xs gap-1.5 h-9"
                      disabled={loadingId === place.place_id}
                      onClick={() => handleAdd(place)}
                    >
                      {loadingId === place.place_id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Plus className="h-3.5 w-3.5" />}
                      Add to Selah
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Sign in to add</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
