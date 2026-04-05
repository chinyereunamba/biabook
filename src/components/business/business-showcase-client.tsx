"use client";

import React, { useState } from "react";
import { ShowcaseHero } from "@/components/business/showcase-hero";
import { BusinessGallery } from "@/components/business/business-gallery";
import { ShareDialog } from "@/components/business/share-dialog";
import { Button } from "@/components/ui/button";
import { Timer, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BusinessShowcaseClientProps {
    business: any; // Type this properly based on your schema
}

export function BusinessShowcaseClient({ business }: BusinessShowcaseClientProps) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const businessUrl = typeof window !== "undefined" ? window.location.href : "";

    return (
        <div className="bg-background min-h-screen pb-24">
            <ShowcaseHero
                name={business.name}
                description={business.description}
                location={business.location ? `${business.location.city}, ${business.location.state}` : "Lagos, Nigeria"}
                coverImage={business.coverImage}
                profileImage={business.profileImage}
                category={business.category?.name}
                onShare={() => setIsShareOpen(true)}
                bookingUrl={`/book/${business.slug}`}
            />

            <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-20">
                    {/* Services Section */}
                    <section id="services" className="space-y-8">
                        <div className="flex justify-between items-end border-b border-surface-container-high pb-6">
                            <div className="space-y-1">
                                <h2 className="font-display text-3xl font-extrabold text-primary tracking-tight">Expert Services</h2>
                                <p className="text-on-surface-variant font-sans text-sm">Curated offerings for your professional needs.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {business.services.map((service: any) => (
                                <div
                                    key={service.id}
                                    className="group flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[2rem] bg-surface-container-low border border-transparent hover:border-primary/20 hover:bg-surface-container-lowest transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-display text-xl font-bold text-primary">{service.name}</h3>
                                            {service.category && (
                                                <span className="bg-secondary/10 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                                                    {service.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-on-surface-variant font-sans text-sm max-w-md leading-relaxed">
                                            {service.description ?? "Experience premium artisan detail with our signature service."}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-bold text-secondary tracking-wide">
                                            <div className="flex items-center gap-1.5">
                                                <Timer className="w-4 h-4" />
                                                <span>{service.duration} mins</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-surface-container-highest" />
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Instant Confirmation</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 md:mt-0 md:pl-8 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 border-t md:border-t-0 md:border-l border-surface-container-high pt-6 md:pt-0">
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-primary font-display tracking-tight">
                                                ₦{(service.price / 100).toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                                                Starting Price
                                            </div>
                                        </div>
                                        <Button
                                            variant="artisan"
                                            size="lg"
                                            asChild
                                            className="px-8 shadow-md"
                                        >
                                            <Link href={`/book/${business.slug}?service=${service.id}`}>Book Now</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery Section */}
                    <BusinessGallery images={business.gallery ?? []} />
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* Booking Card */}
                    <div className="sticky top-24 p-8 rounded-[2.5rem] bg-surface-container-highest border border-surface-container shadow-2xl shadow-primary/5">
                        <div className="space-y-6">
                            <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-primary shadow-sm">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary font-display leading-tight">Book an Appointment</h4>
                                    <p className="text-xs text-on-surface-variant font-sans">Pick your favorite stylist and time.</p>
                                </div>
                            </div>

                            <Button
                                variant="artisan"
                                size="xl"
                                className="w-full h-16 text-lg"
                                asChild
                            >
                                <Link href={`/book/${business.slug}`}>Select Date & Time</Link>
                            </Button>

                            <div className="space-y-4 pt-4 border-t border-surface-container">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-2">Why book with us?</h5>
                                <div className="space-y-3">
                                    {[
                                        "Verified Modern Artisans",
                                        "Seamless WhatsApp Reminders",
                                        "Secure Online Booking",
                                        "Instant Confirmation"
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm font-sans text-on-surface-variant">
                                            <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <ShareDialog
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                url={businessUrl}
                businessName={business.name}
            />
        </div>
    );
}
