"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

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

export function CreateChurchModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to create church");
      return;
    }
    const { data: church } = await res.json();
    toast.success("Church created! You are now the admin.");
    reset();
    setOpen(false);
    router.push(`/bibleapp/community/churches/${church.id}`);
  };

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Church
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your Church</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Church Name *</Label>
              <Input placeholder="Grace Community Church" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="A brief description of your church..." rows={3} {...register("description")} />
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

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="Jl. Sudirman No. 1" {...register("address")} />
            </div>

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
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" loading={isSubmitting}>Create Church</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
