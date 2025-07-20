"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Copy,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Hash,
  Building,
} from "lucide-react";
import { AppointmentWithDetails } from "@/types/booking";

interface BookingDetailsProps {
  booking: AppointmentWithDetails;
  onEdit?: () => void;
  onUpdateStatus?: (status: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

export function BookingDetails({
  booking,
  onEdit,
  onUpdateStatus,
  onCancel,
  onClose,
  className = "",
}: BookingDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}:00`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(newStatus);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setShowCancelDialog(false);
  };

  const isUpcoming = () => {
    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.startTime}:00`);
    return appointmentDateTime > new Date();
  };

  const canModify = () => {
    return booking.status !== 'cancelled' && booking.status !== 'completed';
  };

  return (
    <>
      <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600">View and manage appointment information</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Status and Confirmation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusColor(booking.status)} flex items-center`}>
                  {getStatusIcon(booking.status)}
                  <span className="ml-1 capitalize">{booking.status}</span>
                </Badge>
                {isUpcoming() && booking.status === 'confirmed' && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Upcoming
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Confirmation Number</p>
                  <p className="font-mono font-bold">{booking.confirmationNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyConfirmationNumber}
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

            {/* Quick Actions */}
            {canModify() && (
              <div className="flex flex-wrap gap-2">
                {booking.status === 'pending' && onUpdateStatus && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate('confirmed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
                
                {booking.status === 'confirmed' && onUpdateStatus && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                )}

                {onEdit && (
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}

                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-semibold">{booking.service.name}</p>
                  {booking.service.description && (
                    <p className="text-sm text-gray-500">{booking.service.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-xl font-bold text-green-600">
                      ${formatPrice(booking.service.price)}
                    </p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">{booking.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{booking.customerName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${booking.customerEmail}`}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {booking.customerEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {booking.customerPhone}
                  </a>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Business</p>
                    <p className="font-semibold">{booking.business.name}</p>
                  </div>
                </div>

                {booking.business.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-sm">{booking.business.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-mono text-sm">{booking.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="font-medium">Booking Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(
                      booking.createdAt.toISOString().split('T')[0],
                      booking.createdAt.toTimeString().split(' ')[0].substring(0, 5)
                    )}
                  </p>
                </div>
              </div>

              {booking.updatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(
                        booking?.updatedAt.toISOString().split('T')[0],
                        booking?.updatedAt.toTimeString().split(' ')[0].substring(0, 5)
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'completed' ? 'bg-green-600' : 
                  booking.status === 'cancelled' ? 'bg-red-600' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium">Appointment Scheduled</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(booking.appointmentDate, booking.startTime)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}