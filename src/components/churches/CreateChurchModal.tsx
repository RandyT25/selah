"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Navigation, Loader2, Church, ImagePlus, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().optional(),
  address: z.string().optional(),
  denomination: z.string().optional(),
  pastorName: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface NearbyChurch {
  id: string;
  name: string;
  city: string;
  province: string | null;
  logo_url: string | null;
  member_count: number | null;
  distance_km?: number;
}

function geoErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. Open your browser settings and allow location for this site.";
    case error.POSITION_UNAVAILABLE:
      return "Your location could not be determined. Make sure GPS is enabled on your device.";
    case error.TIMEOUT:
      return "Location request timed out. Check your GPS signal and try again.";
    default:
      return "Could not get location. Try again.";
  }
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

async function fetchNearbyChurches(lat: number, lng: number): Promise<NearbyChurch[]> {
  const res = await fetch(`/api/churches?lat=${lat}&lng=${lng}&radius=25`);
  if (!res.ok) return [];
  const { data } = await res.json();
  return data ?? [];
}

export function CreateChurchModal() {
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [nearby, setNearby] = useState<NearbyChurch[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Load Google Places autocomplete when modal opens
  useEffect(() => {
    if (!open) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !addressInputRef.current) return;

    loadGooglePlaces(apiKey).then(() => {
      if (!addressInputRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["establishment", "geocode"],
        fields: ["address_components", "formatted_address", "geometry"],
      });
      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newCoords = { lat, lng };
        setCoords(newCoords);
        setValue("address", place.formatted_address ?? "");

        const components = place.address_components ?? [];
        const city = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("locality"))?.long_name
          ?? components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("administrative_area_level_2"))?.long_name
          ?? "";
        const province = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("administrative_area_level_1"))?.long_name ?? "";

        if (city) setValue("city", city);
        if (province) setValue("province", province);

        // Load nearby churches for this location
        setNearbyLoading(true);
        const churches = await fetchNearbyChurches(lat, lng);
        setNearby(churches);
        setNearbyLoading(false);
      });
    });
  }, [open, setValue]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setGeoLoading(false);
        toast.success("Location captured!");

        // Load nearby churches
        setNearbyLoading(true);
        const churches = await fetchNearbyChurches(lat, lng);
        setNearby(churches);
        setNearbyLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        toast.error(geoErrorMessage(error), { duration: 6000 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", "churches");
    form.append("path", `temp-${Date.now()}/logo.${ext}`);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    setLogoUploading(false);
    if (!res.ok) { toast.error("Logo upload failed"); return; }
    const { url } = await res.json();
    setLogoUrl(url);
    e.target.value = "";
  };

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        logo_url: logoUrl ?? null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to create church");
      return;
    }
    const { data: church } = await res.json();
    toast.success("Church created! You are now the admin.");
    reset();
    setCoords(null);
    setLogoUrl(null);
    setNearby([]);
    setOpen(false);
    router.push(`/bibleapp/community/churches/${church.id}`);
  };

  const handleClose = () => {
    setOpen(false);
    setNearby([]);
    setCoords(null);
    setLogoUrl(null);
  };

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Church
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your Church</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Logo upload */}
            <div className="space-y-1.5">
              <Label>Church Logo / Photo</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden flex-shrink-0 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUploading
                    ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    : logoUrl
                      ? <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      : <Church className="h-6 w-6 text-muted-foreground/50" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="gap-1.5 text-xs"
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    {logoUrl ? "Change Photo" : "Upload Logo"}
                  </Button>
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl(null)} className="ml-2 text-xs text-destructive hover:underline">
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5 MB</p>
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            <div className="space-y-1.5">
              <Label>Church Name *</Label>
              <Input placeholder="Grace Community Church" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="A brief description of your church..." rows={3} {...register("description")} />
            </div>

            {/* Address with Google Places autocomplete */}
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                placeholder="Start typing address…"
                {...register("address")}
                ref={(el) => {
                  register("address").ref(el);
                  addressInputRef.current = el;
                }}
              />
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <p className="text-xs text-muted-foreground">Powered by Google Maps — city &amp; location fill automatically</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input placeholder="Jakarta" {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Province</Label>
                <Input placeholder="DKI Jakarta" {...register("province")} />
              </div>
            </div>

            {/* Location button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="gap-1.5 text-xs"
              >
                {geoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                {coords ? "Location set ✓" : "Use My Location"}
              </Button>
              {coords && (
                <span className="text-xs text-muted-foreground">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
              )}
            </div>

            {/* Nearby churches panel */}
            {(nearbyLoading || nearby.length > 0) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Churches already near this location
                </p>
                {nearbyLoading ? (
                  <div className="flex items-center gap-2 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-xs text-amber-700">Finding nearby churches…</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {nearby.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 rounded-lg p-2 border border-amber-100 dark:border-amber-900">
                        <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {c.logo_url
                            ? <img src={c.logo_url} alt={c.name} className="h-full w-full object-cover" />
                            : <Church className="h-4 w-4 text-muted-foreground" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.city}{c.province ? `, ${c.province}` : ""}
                            {c.distance_km != null ? ` · ${c.distance_km < 1 ? `${Math.round(c.distance_km * 1000)}m` : `${c.distance_km.toFixed(1)}km`} away` : ""}
                          </p>
                        </div>
                        <Link
                          href={`/bibleapp/community/churches/${c.id}`}
                          target="_blank"
                          className="text-[10px] text-primary font-medium flex items-center gap-0.5 flex-shrink-0 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    ))}
                    <p className="text-[10px] text-amber-700 dark:text-amber-500">
                      Make sure your church isn't already listed before adding.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Denomination</Label>
                <Input placeholder="e.g. Baptist, Pentecostal" {...register("denomination")} />
              </div>
              <div className="space-y-1.5">
                <Label>Pastor</Label>
                <Input placeholder="Ps. John Doe" {...register("pastorName")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input type="url" placeholder="https://your-church.com" {...register("website")} />
              {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" loading={isSubmitting}>Create Church</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
