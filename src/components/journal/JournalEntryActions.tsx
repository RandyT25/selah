"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function JournalEntryActions({ entryId, isFavorite }: { entryId: string; isFavorite: boolean }) {
  const [favorite, setFavorite] = useState(isFavorite);
  const router = useRouter();

  const toggleFavorite = async () => {
    const supabase = createClient();
    const newVal = !favorite;
    setFavorite(newVal);
    await supabase.from("journal_entries").update({ is_favorite: newVal } as Record<never, never>).eq("id", entryId);
    toast.success(newVal ? "Added to favorites" : "Removed from favorites");
  };

  const handleDelete = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("journal_entries").delete().eq("id", entryId);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      router.push("/journal");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleFavorite}
        className={favorite ? "text-amber-500" : ""}
        title={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
      </Button>

      <Button variant="outline" size="sm" asChild>
        <Link href={`/journal/edit/${entryId}`}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This journal entry will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
