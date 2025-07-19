"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    MapPin,
    MessageSquare,
    Copy,
    ExternalLink
} from "lucide-react";
import { useState } from "react";

export interface BookingConfirmationData {
    id: string;
    confirmationNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status: string;
    business: {
        id: string;
        name: string;
        phone?: string;
        email?: string;
        location?: string;
    };
    service: {
        id: string;
        name: string;
        duration: number;
        price: number;
    };
}

interface BookingConfirmationProps {
    booking: BookingConfirmationData;
    onNewBooking?: () => void;
    className?: string;
}

export function BookingConfirmation({
    booking,
    onNewBooking,
    className = ""
}: BookingConfirmationProps) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours || '0'), parseInt(minutes || '0'));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatPrice = (priceInCents: number) => {
        return (priceInCents / 100).toFixed(2);
    };

    const copyConfirmationNumber = async () => {
        try {
            await navigator.clipboard.writeText(booking.confirmationNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy confirmation number:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const generateCalendarLink = (type: 'google' | 'outlook' | 'ics') => {
        const startDateTime = new Date(`${booking.appointmentDate}T${booking.startTime}:00`);
        const endDateTime = new Date(`${booking.appointmentDate}T${booking.endTime}:00`);

        const title = `${booking.service.name} - ${booking.business.name}`;
        const description = `Appointment with ${booking.business.name}\n\nService: ${booking.service.name}\nDuration: ${booking.service.duration} minutes\nPrice: $${formatPrice(booking.service.price)}\n\nCustomer: ${booking.customerName}\nPhone: ${booking.customerPhone}\nEmail: ${booking.customerEmail}\n\nConfirmation: ${booking.confirmationNumber}${booking.notes ? `\n\nNotes: ${booking.notes}` : ''}`;
        const location = booking.business.location || booking.business.name;

        if (type === 'google') {
            const googleUrl = new URL('https://calendar.google.com/calendar/render');
            googleUrl.searchParams.set('action', 'TEMPLATE');
            googleUrl.searchParams.set('text', title);
            googleUrl.searchParams.set('dates', `${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
            googleUrl.searchParams.set('details', description);
            googleUrl.searchParams.set('location', location);
            window.open(googleUrl.toString(), '_blank');
        } else if (type === 'outlook') {
            const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
            outlookUrl.searchParams.set('subject', title);
            outlookUrl.searchParams.set('startdt', startDateTime.toISOString());
            outlookUrl.searchParams.set('enddt', endDateTime.toISOString());
            outlookUrl.searchParams.set('body', description);
            outlookUrl.searchParams.set('location', location);
            window.open(outlookUrl.toString(), '_blank');
        } else if (type === 'ics') {
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//BookMe//Appointment//EN',
                'BEGIN:VEVENT',
                `UID:${booking.id}@bookme.app`,
                `DTSTART:${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTEND:${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
                `LOCATION:${location}`,
                'STATUS:CONFIRMED',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `appointment-${booking.confirmationNumber}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className={`max-w-2xl mx-auto ${className}`}>
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                </h1>
                <p className="text-lg text-gray-600">
                    Your appointment has been successfully booked with {booking.business.name}
                </p>
            </div>

            {/* Confirmation Details Card */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    {/* Confirmation Number */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                            <p className="text-sm font-medium text-blue-900">Confirmation Number</p>
                            <p className="text-xl font-bold text-blue-900">{booking.confirmationNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(booking.status)}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyConfirmationNumber}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Date & Time */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-semibold">{formatDate(booking.appointmentDate)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Time</p>
                                    <p className="font-semibold">
                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ({booking.service.duration} minutes)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Service & Price */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Service</p>
                                <p className="font-semibold">{booking.service.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-xl font-bold text-green-600">
                                    ${formatPrice(booking.service.price)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="border-t pt-4 mt-6">
                        <h3 className="font-semibold mb-3">Customer Information</h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="flex items-center space-x-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">{booking.customerName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium">{booking.customerPhone}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 md:col-span-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium">{booking.customerEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-start space-x-3">
                                <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-sm">{booking.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Information */}
                    <div className="border-t pt-4 mt-6">
                        <h3 className="font-semibold mb-3">Business Information</h3>
                        <div className="space-y-2">
                            <p className="font-medium">{booking.business.name}</p>

                            {booking.business.location && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{booking.business.location}</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-4 text-sm">
                                {booking.business.phone && (
                                    <a
                                        href={`tel:${booking.business.phone}`}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <Phone className="h-4 w-4" />
                                        <span>{booking.business.phone}</span>
                                    </a>
                                )}

                                {booking.business.email && (
                                    <a
                                        href={`mailto:${booking.business.email}`}
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <Mail className="h-4 w-4" />
                                        <span>{booking.business.email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        What Happens Next
                    </h3>
                    <div className="space-y-3 text-sm text-blue-700">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">1</div>
                            <div>
                                <p className="font-medium">Confirmation Sent</p>
                                <p className="text-blue-600">You'll receive email and SMS confirmations within minutes</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">2</div>
                            <div>
                                <p className="font-medium">Business Notified</p>
                                <p className="text-blue-600">The business owner has been notified via WhatsApp</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">3</div>
                            <div>
                                <p className="font-medium">Appointment Day</p>
                                <p className="text-blue-600">Please arrive 5 minutes early with your confirmation number</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Integration */}
            <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Add to Calendar
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                        Don't forget your appointment! Add it to your calendar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCalendarLink('google')}
                            className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                            Google Calendar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCalendarLink('outlook')}
                            className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                            Outlook
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCalendarLink('ics')}
                            className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                            Download .ics
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {onNewBooking && (
                    <Button onClick={onNewBooking} size="lg">
                        Book Another Appointment
                    </Button>
                )}

                <Button
                    variant="outline"
                    size="lg"
                    asChild
                >
                    <a href="/">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Back to Home
                    </a>
                </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    Need to cancel or reschedule? Contact {booking.business.name} directly or
                    use the links in your confirmation email.
                </p>
            </div>
        </div>
    );
}