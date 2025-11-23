"use client";

import { Check, X } from "lucide-react";

export function PlanComparison() {
  const features = [
    {
      category: "Bookings",
      items: [
        {
          name: "Monthly bookings",
          starter: "50",
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
        { name: "Booking page", starter: true, pro: true, enterprise: true },
        {
          name: "Custom branding",
          starter: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Multiple locations",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "Notifications",
      items: [
        {
          name: "Email notifications",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "WhatsApp notifications",
          starter: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "SMS notifications",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
    {
      category: "Management",
      items: [
        {
          name: "Customer management",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Service management",
          starter: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Team management",
          starter: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "Analytics & reports",
          starter: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support & Integration",
      items: [
        { name: "Email support", starter: true, pro: true, enterprise: true },
        {
          name: "Priority support",
          starter: false,
          pro: true,
          enterprise: true,
        },
        {
          name: "Dedicated support",
          starter: false,
          pro: false,
          enterprise: true,
        },
        { name: "API access", starter: false, pro: false, enterprise: true },
        {
          name: "White-label options",
          starter: false,
          pro: false,
          enterprise: true,
        },
      ],
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="text-primary mx-auto h-5 w-5" />
      ) : (
        <X className="text-foreground/20 mx-auto h-5 w-5" />
      );
    }
    return <span className="text-foreground text-sm font-medium">{value}</span>;
  };

  return (
    <section className="bg-foreground/5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Compare all features
          </h2>
          <p className="text-foreground/70 text-lg">
            Find the perfect plan for your business needs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="bg-card w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-foreground w-1/2 p-4 text-left font-semibold md:p-6">
                  Features
                </th>
                <th className="text-foreground p-4 text-center font-semibold md:p-6">
                  <div>Starter</div>
                  <div className="text-foreground/60 mt-1 text-sm font-normal">
                    Free
                  </div>
                </th>
                <th className="text-primary bg-primary/5 p-4 text-center font-semibold md:p-6">
                  <div>Pro</div>
                  <div className="text-foreground/60 mt-1 text-sm font-normal">
                    $19/mo
                  </div>
                </th>
                <th className="text-foreground p-4 text-center font-semibold md:p-6">
                  <div>Enterprise</div>
                  <div className="text-foreground/60 mt-1 text-sm font-normal">
                    $49/mo
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <>
                  <tr
                    key={`category-${categoryIndex}`}
                    className="bg-foreground/5"
                  >
                    <td
                      colSpan={4}
                      className="text-foreground/80 p-3 text-sm font-semibold tracking-wide uppercase md:p-4"
                    >
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr
                      key={`item-${categoryIndex}-${itemIndex}`}
                      className="border-border border-b last:border-0"
                    >
                      <td className="text-foreground/80 p-4 md:p-6">
                        {item.name}
                      </td>
                      <td className="p-4 text-center md:p-6">
                        {renderCell(item.starter)}
                      </td>
                      <td className="bg-primary/5 p-4 text-center md:p-6">
                        {renderCell(item.pro)}
                      </td>
                      <td className="p-4 text-center md:p-6">
                        {renderCell(item.enterprise)}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <p className="text-foreground/60 text-sm">
            All plans include SSL security, 99.9% uptime, and mobile-responsive
            booking pages
          </p>
        </div>
      </div>
    </section>
  );
}
