"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GalleryImage {
    id: string;
    imageUrl: string;
    caption?: string | null;
}

interface BusinessGalleryProps {
    images: GalleryImage[];
    className?: string;
}

export function BusinessGallery({ images, className }: BusinessGalleryProps) {
    if (!images || images.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-surface-container rounded-[2rem] bg-surface-container-lowest/50">
                <p className="text-on-surface-variant font-sans italic opacity-60">
                    No portfolio images added yet.
                </p>
            </div>
        );
    }

    return (
        <section className={cn("space-y-8", className)}>
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="font-display text-3xl font-extrabold text-primary tracking-tight">Portfolio Gallery</h2>
                    <p className="text-on-surface-variant font-sans text-sm">A glimpse into our artisan excellence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, idx) => (
                    <div
                        key={image.id}
                        className={cn(
                            "group relative overflow-hidden rounded-[2rem] bg-surface-container-low transition-all duration-700 hover:shadow-2xl",
                            idx % 4 === 1 ? "md:row-span-2 h-[400px] md:h-full" : "h-[300px]"
                        )}
                    >
                        <Image
                            src={image.imageUrl}
                            alt={image.caption ?? `Gallery image ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                <p className="text-white font-sans text-sm font-medium leading-relaxed">
                                    {image.caption}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
