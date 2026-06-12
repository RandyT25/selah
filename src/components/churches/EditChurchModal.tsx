"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings2, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Church } from "@/types/database";

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
  church: Church;
}

export function EditChurchModal({ church }: Props) {
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    church.latitude != null && church.longitude != null
      ? { lat: church.latitude, lng: church.longitude }
      : null
  );
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
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

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
        toast.success("Location updated!");
      },
      () => { setGeoLoading(false); toast.error("Could not get location"); },
      { timeout: 8000 }
    );
  };

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`/api/churches/${church.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
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
            <div className="space-y-1.5">
              <Label>Church Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
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

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input {...register("address")} />
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
