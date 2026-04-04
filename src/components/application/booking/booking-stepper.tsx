"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BookingStepperProps {
    currentStep: number;
    steps?: string[];
    className?: string;
}

const DEFAULT_STEPS = [
    "Select Service",
    "Choose Time",
    "Your Details",
    "Confirmation",
];

export function BookingStepper({
    currentStep,
    steps = DEFAULT_STEPS,
    className,
}: BookingStepperProps) {
    return (
        <div className={cn("w-full py-8", className)}>
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                {/* Progress Line */}
                <div className="absolute top-[22px] left-0 w-full h-[2px] bg-surface-container-high -z-10" />
                <div
                    className="absolute top-[22px] left-0 h-[2px] bg-primary transition-all duration-700 ease-in-out -z-10"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;

                    return (
                        <div key={step} className="flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-background",
                                    isCompleted
                                        ? "bg-primary border-primary text-on-primary shadow-lg scale-110"
                                        : isActive
                                            ? "border-primary text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-110"
                                            : "border-surface-container-high text-on-surface-variant group-hover:border-primary/50"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold font-sans">{stepNumber}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "mt-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 text-center px-2",
                                    isActive || isCompleted ? "text-primary" : "text-on-surface-variant opacity-60"
                                )}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
