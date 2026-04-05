"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    businessName: string;
}

export function ShareDialog({ isOpen, onClose, url, businessName }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-surface border-surface-container-high rounded-[2rem] p-8">
                <DialogHeader className="space-y-3 pb-4">
                    <DialogTitle className="font-display text-3xl font-extrabold text-primary text-center">
                        Share {businessName}
                    </DialogTitle>
                    <DialogDescription className="text-center font-sans text-on-surface-variant">
                        Invite others to experience the excellence of {businessName} or save for your next visit.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-8 py-4">
                    {/* QR Code */}
                    <div className="p-6 bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-surface-container">
                        <QRCodeSVG
                            value={url}
                            size={200}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo.svg", // Assuming a logo exists, or omit
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Copy Link Area */}
                    <div className="w-full space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 ml-4">
                            Profile Link
                        </label>
                        <div className="flex items-center gap-2 bg-surface-container-low p-2 pl-6 rounded-full border border-surface-container">
                            <span className="flex-1 truncate text-sm font-sans text-on-surface-variant select-all">
                                {url}
                            </span>
                            <Button
                                size="sm"
                                variant="artisan"
                                onClick={handleCopy}
                                className="rounded-full px-6"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Button
                        variant="ghost"
                        className="rounded-full hover:bg-surface-container hover:text-primary transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
