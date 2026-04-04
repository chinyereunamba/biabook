"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ArtisanCardProps {
    id: string;
    name: string;
    category: string;
    image: string;
    rating?: number;
    price?: string;
    distance?: string;
    description?: string;
    variant?: "grid" | "horizontal";
    className?: string;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({
    id,
    name,
    category,
    image,
    rating = 4.8,
    price = "₦25,000",
    distance = "1.2km away",
    description,
    variant = "grid",
    className,
}) => {
    const isHorizontal = variant === "horizontal";

    return (
        <div
            className={cn(
                "group bg-surface rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500",
                isHorizontal ? "flex-shrink-0 w-80 md:w-[500px] snap-center" : "flex flex-col h-full",
                className
            )}
        >
            <div className={cn("relative overflow-hidden", isHorizontal ? "h-72" : "h-80")}>
                <img
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    src={image}
                />
                <div className="absolute top-6 left-6 text-white bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide font-sans backdrop-blur-sm bg-primary/90">
                    {category}
                </div>
                {isHorizontal && (
                    <div className="absolute top-6 right-6 bg-primary text-on-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] font-sans shadow-lg">
                        TOP RATED
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <h3 className="font-display text-xl font-bold text-primary mb-1 line-clamp-1">{name}</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-secondary">
                                <span className="material-symbols-outlined text-sm fill-1">star</span>
                                <span className="font-bold text-sm ml-1">{rating}</span>
                            </div>
                            <span className="text-on-surface-variant text-xs font-sans">• {distance}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-on-surface-variant block font-sans">From</span>
                        <span className="text-xl font-extrabold text-primary font-display">{price}</span>
                    </div>
                </div>

                <div className="flex-1">
                    {description && (
                        <p className="text-on-surface-variant text-md mb-8 line-clamp-2 leading-relaxed font-sans opacity-90">
                            {description}
                        </p>
                    )}
                </div>

                <div className="mt-auto">
                    <Button
                        variant="artisan"
                        className="w-full"
                        asChild
                    >
                        <Link href={`/book/${id}`}>
                            Book Instant Appointment
                            <span className="material-symbols-outlined ml-2 text-[1.25em]">arrow_forward</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
