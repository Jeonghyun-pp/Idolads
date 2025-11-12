"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/events/EventCard";
import { LayoutGrid, Calendar as CalendarIcon, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Event = {
  id: string;
  title: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  perks: string[];
  celeb: {
    id: string;
    name: string;
  };
  place: {
    id: string;
    name: string;
  } | null;
};

export default function EventsContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "calendar" | "map">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("startDate");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("sortBy", sortBy);

        const response = await fetch(`/api/events?${params.toString()}`);
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [search, sortBy]);

  return (
    <div>
      {/* Filters & View Toggle */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="이벤트 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate">시작일순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="newest">최신순</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border border-white/10 rounded-md p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">카드</span>
            </Button>
            <Button
              variant={view === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden md:inline">달력</span>
            </Button>
            <Button
              variant={view === "map" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("map")}
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              <span className="hidden md:inline">지도</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              imageUrl={
                event.imageUrl ||
                "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=1200&fit=crop"
              }
              celebName={event.celeb.name}
              title={event.title}
              startDate={event.startDate}
              endDate={event.endDate}
              place={event.place?.name || "장소 미정"}
              perks={event.perks}
            />
          ))}
        </div>
      ) : view === "calendar" ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-zinc-400">달력 뷰는 개발 중입니다.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-zinc-400">지도 뷰는 개발 중입니다.</p>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

