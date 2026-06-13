"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings2, Navigation, Loader2, Church, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Church as ChurchType } from "@/types/database";

const schema = z.object({
  name:         z.string().min(2).max(100),
  description:  z.string().max(500).optional(),
  city:         z.string().min(2, "City is required"),
  province:     z.string().optional(),
  address:      z.string().optional(),
  denomination: z.string().optional(),
  pastorName:   z.string().optional(),
  website:      z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Props {
  church: ChurchType;
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

export function EditChurchModal({ church }: Props) {
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    church.latitude != null && church.longitude != null
      ? { lat: church.latitude, lng: church.longitude }
      : null
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(church.logo_url ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         church.name,
      description:  church.description  ?? "",
      city:         church.city,
      province:     church.province     ?? "",
      address:      church.address      ?? "",
      denomination: church.denomination ?? "",
      pastorName:   church.pastor_name  ?? "",
      website:      church.website      ?? "",
    },
  });

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
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        setCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        setValue("address", place.formatted_address ?? "");

        const components = place.address_components ?? [];
        const city = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("locality"))?.long_name
          ?? components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("administrative_area_level_2"))?.long_name
          ?? "";
        const province = components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes("administrative_area_level_1"))?.long_name ?? "";

        if (city) setValue("city", city);
        if (province) setValue("province", province);
      });
    });
  }, [open, setValue]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation is not supported by your browser"); return; }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        toast.success("Location updated!");
      },
      (error) => {
        setGeoLoading(false);
        const messages: Record<number, string> = {
          1: "Location access was denied. Open your browser settings and allow location for this site.",
          2: "Your location could not be determined. Make sure GPS is enabled on your device.",
          3: "Location request timed out. Check your GPS signal and try again.",
        };
        toast.error(messages[error.code] ?? "Could not get location. Try again.", { duration: 6000 });
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
    form.append("path", `${church.id}/logo.${ext}`);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    setLogoUploading(false);
    if (!res.ok) { toast.error("Logo upload failed"); return; }
    const { url } = await res.json();
    setLogoUrl(url);
    e.target.value = "";
  };

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`/api/churches/${church.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        logo_url: logoUrl ?? null,
        latitude:  coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to update");
      return;
    }
    toast.success("Church updated!");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Settings2 className="h-4 w-4" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Church</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Logo upload */}
            <div className="space-y-1.5">
              <Label>Church Logo / Photo</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-content overflow-hidden flex-shrink-0 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUploading
                    ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    : logoUrl
                      ? <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      : <Church className="h-6 w-6 text-muted-foreground/50" />
                  }
                </div>
                <div className="flex-1">
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
                    <button
                      type="button"
                      onClick={() => setLogoUrl(null)}
                      className="ml-2 text-xs text-destructive hover:underline"
                    >
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
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
            </div>

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
                <p className="text-xs text-muted-foreground">Powered by Google Maps — city &amp; location auto-fill</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Input {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Province</Label>
                <Input {...register("province")} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation} disabled={geoLoading} className="gap-1.5 text-xs">
                {geoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                {coords ? "Location set ✓" : "Use My Location"}
              </Button>
              {coords && (
                <span className="text-xs text-muted-foreground">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Denomination</Label>
                <Input {...register("denomination")} />
              </div>
              <div className="space-y-1.5">
                <Label>Pastor</Label>
                <Input {...register("pastorName")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input type="url" {...register("website")} />
              {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" loading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
