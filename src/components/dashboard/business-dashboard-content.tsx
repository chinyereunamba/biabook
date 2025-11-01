"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  Settings,
  BarChart3,
  Clock,
  UserCheck,
  Bell,
  Wrench,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OverviewSection,
  BookingsSection,
  CustomersSection,
  ServicesSection,
  AvailabilitySection,
  StaffSection,
  NotificationsSection,
  SettingsSection,
  ReportsSection,
} from "./business-sections";

export function BusinessDashboardContent() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "See today's bookings, revenue, and key stats",
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: Calendar,
      description: "View, reschedule, or cancel customer appointments",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      description: "See all clients, contact them, and view booking history",
    },
    {
      id: "services",
      label: "Services",
      icon: Wrench,
      description: "Add, edit, or remove offered services and prices",
    },
    {
      id: "availability",
      label: "Availability",
      icon: Clock,
      description: "Set available days/hours (and prevent double booking)",
    },
    {
      id: "staff",
      label: "Staff",
      icon: UserCheck,
      description: "Add staff, assign them to services, set schedules",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Email or WhatsApp (user-initiated) confirmations",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description:
        "Manage business info, logo, contact details, and working hours",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      description: "Booking count, cancellations, and revenue summaries",
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;
      case "bookings":
        return <BookingsSection />;
      case "customers":
        return <CustomersSection />;
      case "services":
        return <ServicesSection />;
      case "availability":
        return <AvailabilitySection />;
      case "staff":
        return <StaffSection />;
      case "notifications":
        return <NotificationsSection />;
      case "settings":
        return <SettingsSection />;
      case "reports":
        return <ReportsSection />;
      default:
        return <OverviewSection />;
    }
  };

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="bg-background flex h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-card border-border fixed inset-y-0 left-0 z-50 w-64 transform border-r transition-transform duration-200 ease-in-out lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} `}
      >
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Business Dashboard</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 overflow-y-auto p-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card/50 border-border border-b backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{currentSection?.label}</h1>
                <p className="text-muted-foreground text-sm">
                  {currentSection?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <div className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                BM
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderSection()}</div>
      </div>
    </div>
  );
}
