"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Users, Navigation, Loader2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Church } from "@/types/database";

interface Props {
  churches: Church[];
  joinedIds: Set<string>;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

type ChurchWithDist = Church & { distanceKm?: number };

export function ChurchesListWithLocation({ churches, joinedIds }: Props) {
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [sorted, setSorted] = useState<ChurchWithDist[]>(churches);
  const [nearMeActive, setNearMeActive] = useState(false);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const withDist: ChurchWithDist[] = churches.map((c) => ({
          ...c,
          distanceKm:
            c.latitude != null && c.longitude != null
              ? haversineKm(latitude, longitude, c.latitude, c.longitude)
              : undefined,
        }));
        withDist.sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) return 0;
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });
        setSorted(withDist);
        setNearMeActive(true);
        setLocLoading(false);
      },
      (err) => {
        setLocError(
          err.code === 1
            ? "Location access denied. Please allow location in your browser."
            : "Could not get your location. Try again."
        );
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, [churches]);

  const clearNearMe = () => {
    setSorted(churches);
    setNearMeActive(false);
    setLocError(null);
  };

  return (
    <div>
      {/* Near Me controls */}
      <div className="flex items-center gap-2 mb-4">
        {nearMeActive ? (
          <Button variant="outline" size="sm" onClick={clearNearMe} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            Clear Near Me
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNearMe}
            disabled={locLoading}
            className="gap-1.5"
          >
            {locLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5" />
            )}
            {locLoading ? "Locating…" : "Near Me"}
          </Button>
        )}
        {locError && (
          <p className="text-xs text-destructive">{locError}</p>
        )}
        {nearMeActive && (
          <p className="text-xs text-muted-foreground">
            Showing {sorted.filter((c) => c.distanceKm != null).length} nearby churches
          </p>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No churches found
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((church) => (
            <Link key={church.id} href={`/bibleapp/community/churches/${church.id}`}>
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12 rounded-lg shrink-0">
                      <AvatarImage src={church.logo_url ?? undefined} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {church.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-sm leading-tight">{church.name}</h3>
                        {church.is_verified && (
                          <span className="text-primary text-xs">✓</span>
                        )}
                      </div>
                      {church.denomination && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {church.denomination}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {church.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {church.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {church.city}
                        {church.province ? `, ${church.province}` : ""}
                      </span>
                      {(church as ChurchWithDist).distanceKm != null && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-auto shrink-0 flex items-center gap-0.5">
                          <Navigation className="h-2.5 w-2.5" />
                          {formatDistance((church as ChurchWithDist).distanceKm!)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {church.member_count} member
                        {church.member_count !== 1 ? "s" : ""}
                      </span>
                      {joinedIds.has(church.id) && (
                        <Badge variant="gold" className="text-[9px] px-1.5 py-0 ml-1">
                          Joined
                        </Badge>
                      )}
                    </div>
                    {church.pastor_name && (
                      <p className="truncate">Ps. {church.pastor_name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
