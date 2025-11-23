"use client";

import { Check, X } from "lucide-react";

export function CompetitorComparison() {
  const competitors = [
    {
      feature: "Setup time",
      biabook: "60 seconds",
      others: "15-30 minutes",
    },
    {
      feature: "Customer account required",
      biabook: false,
      others: true,
    },
    {
      feature: "WhatsApp notifications",
      biabook: true,
      others: false,
    },
    {
      feature: "Free plan",
      biabook: "50 bookings/month",
      others: "Limited trial only",
    },
    {
      feature: "Monthly cost (Pro)",
      biabook: "$19",
      others: "$29-$49",
    },
    {
      feature: "Complex configuration",
      biabook: false,
      others: true,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Why choose BiaBook?
          </h2>
          <p className="text-foreground/70 text-lg">
            Simple, fast, and affordable compared to traditional booking
            platforms
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="bg-card w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-foreground p-4 text-left font-semibold md:p-6">
                  Feature
                </th>
                <th className="text-primary bg-primary/5 p-4 text-center font-semibold md:p-6">
                  BiaBook
                </th>
                <th className="text-foreground/70 p-4 text-center font-semibold md:p-6">
                  Other Platforms
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((row, i) => (
                <tr key={i} className="border-border border-b last:border-0">
                  <td className="text-foreground/80 p-4 md:p-6">
                    {row.feature}
                  </td>
                  <td className="bg-primary/5 p-4 text-center md:p-6">
                    {typeof row.biabook === "boolean" ? (
                      row.biabook ? (
                        <Check className="text-primary mx-auto h-6 w-6" />
                      ) : (
                        <X className="text-foreground/30 mx-auto h-6 w-6" />
                      )
                    ) : (
                      <span className="text-foreground font-semibold">
                        {row.biabook}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center md:p-6">
                    {typeof row.others === "boolean" ? (
                      row.others ? (
                        <Check className="text-foreground/30 mx-auto h-6 w-6" />
                      ) : (
                        <X className="text-foreground/30 mx-auto h-6 w-6" />
                      )
                    ) : (
                      <span className="text-foreground/70">{row.others}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
