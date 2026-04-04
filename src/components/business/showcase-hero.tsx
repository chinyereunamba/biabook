"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Share2, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ShowcaseHeroProps {
    name: string;
    description?: string | null;
    location?: string | null;
    coverImage?: string | null;
    profileImage?: string | null;
    category?: string | null;
    onShare: () => void;
    bookingUrl: string;
}

export function ShowcaseHero({
    name,
    description,
    location,
    coverImage,
    profileImage,
    category,
    onShare,
    bookingUrl,
}: ShowcaseHeroProps) {
    return (
        <section className="relative">
            {/* Cover Image Area */}
            <div className="relative h-64 md:h-[400px] w-full overflow-hidden">
                <Image
                    src={coverImage ?? "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop"}
                    alt={`${name} cover`}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="flex flex-col md:flex-row items-end -mt-20 md:-mt-32 gap-6 md:gap-10 pb-12 border-b border-surface-container-high">
                    {/* Profile Image */}
                    <div className="relative group">
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-8 border-background overflow-hidden shadow-2xl bg-surface-container-low transition-transform duration-500 group-hover:scale-105">
                            <Image
                                src={profileImage ?? "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop"}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 space-y-4 text-center md:text-left pt-6 md:pt-0">
                        <div className="space-y-1">
                            {category && (
                                <span className="inline-block bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-sans">
                                    {category}
                                </span>
                            )}
                            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary tracking-tight">
                                {name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-on-surface-variant font-sans text-sm md:text-base">
                            {location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-secondary" />
                                    <span>{location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <span className="font-bold text-on-surface">4.9</span>
                                <span className="opacity-60">(128 Reviews)</span>
                            </div>
                        </div>

                        <p className="max-w-2xl text-on-surface-variant font-sans leading-relaxed text-sm md:text-lg">
                            {description ?? "Professional artisan services tailored to your excellence."}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                            <Button
                                variant="artisan"
                                size="xl"
                                asChild
                                className="px-10"
                            >
                                <Link href={bookingUrl}>
                                    <Calendar className="mr-2 w-5 h-5" />
                                    Book Appointment
                                </Link>
                            </Button>
                            <Button
                                variant="artisan-secondary"
                                size="xl"
                                onClick={onShare}
                                className="px-8"
                            >
                                <Share2 className="mr-2 w-5 h-5" />
                                Share Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
