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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3, "Title required").max(100),
  description: z.string().max(500).optional(),
  eventDate: z.string().min(1, "Date required"),
  eventTime: z.string().optional(),
  location: z.string().optional(),
  isOnline: z.boolean(),
  onlineUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isRecurring: z.boolean(),
  recurrenceType: z.enum(["weekly", "biweekly", "monthly"]).optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateEventModal({ churchId, userId }: { churchId: string; userId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isOnline: false, isRecurring: false },
  });

  const isOnline = watch("isOnline");
  const isRecurring = watch("isRecurring");

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("church_events").insert({
      church_id: churchId,
      title: data.title,
      description: data.description || null,
      event_date: data.eventDate,
      event_time: data.eventTime || null,
      location: data.isOnline ? null : (data.location || null),
      is_online: data.isOnline,
      online_url: data.isOnline ? (data.onlineUrl || null) : null,
      is_recurring: data.isRecurring,
      recurrence_type: data.isRecurring ? (data.recurrenceType ?? null) : null,
      created_by: userId,
    });

    if (error) { toast.error("Failed to create event"); return; }
    toast.success("Event created!");
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Event
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Event Title *</Label>
              <Input placeholder="Sunday Worship Service" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Details about the event..." rows={2} {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date *</Label>
                <Input type="date" {...register("eventDate")} />
                {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Time</Label>
                <Input type="time" {...register("eventTime")} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Online event</Label>
              <Switch checked={isOnline} onCheckedChange={(v) => setValue("isOnline", v)} />
            </div>

            {isOnline ? (
              <div className="space-y-1.5">
                <Label>Meeting URL</Label>
                <Input type="url" placeholder="https://zoom.us/..." {...register("onlineUrl")} />
                {errors.onlineUrl && <p className="text-xs text-destructive">{errors.onlineUrl.message}</p>}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input placeholder="Main Hall, Jl. Sudirman..." {...register("location")} />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Recurring event</Label>
              <Switch checked={isRecurring} onCheckedChange={(v) => setValue("isRecurring", v)} />
            </div>

            {isRecurring && (
              <div className="space-y-1.5">
                <Label>Repeat</Label>
                <Select onValueChange={(v) => setValue("recurrenceType", v as "weekly" | "biweekly" | "monthly")}>
                  <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Every week</SelectItem>
                    <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                    <SelectItem value="monthly">Every month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gold" className="flex-1" loading={isSubmitting}>Create Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
