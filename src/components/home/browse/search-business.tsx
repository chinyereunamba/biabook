"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useTransition } from "react";
import { cn } from "@/lib/utils";

type Props = {
  categories: { id: string; name: string }[];
  onLoadingChange?: (isLoading: boolean) => void;
};

export default function SearchBusiness({ categories, onLoadingChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  // Notify parent component when loading state changes
  React.useEffect(() => {
    onLoadingChange?.(isPending);
  }, [isPending, onLoadingChange]);

  // derive state from URL so it stays in sync after navigation
  const searchTerm = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  function updateURL(newParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => router.replace(`/browse?${params.toString()}`));
  }

  return (
    <>
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const term = formData.get("search")?.toString() || "";
          updateURL({ search: term, category });
        }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="relative flex-1">
          <Input
            name="search"
            defaultValue={searchTerm}
            placeholder="Search for salons, tutors, clinics..."
            className="bg-white"
          />
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          Search
        </Button>
      </form>

      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = category === cat.id;
          return (
            <Button
              key={cat.id}
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() =>
                cat.id !== "all"
                  ? updateURL({ search: searchTerm, category: cat.id })
                  : updateURL({ search: searchTerm, category: "" })
              }
              className={cn(
                active
                  ? "bg-accent text-accent-foreground"
                  : "border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10",
                isPending && "cursor-not-allowed opacity-70",
              )}
            >
              {isPending && active && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              {cat.name}
            </Button>
          );
        })}
      </div>
    </>
  );
}
