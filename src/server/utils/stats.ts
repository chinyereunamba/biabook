import { analyticsRepository } from "@/server/repositories/analytics-repository";

export async function getDashboardStats(businessId: string) {
    const analytics =
        await analyticsRepository.getBookingAnalytics(businessId);

    return [
        {
            title: "Total Revenue",
            value: formatCurrency(analytics.totalRevenue),
            change: formatPercent(analytics.monthlyGrowth),
            footer: "All-time revenue",
            key: "total-revenue",
        },
        {
            title: "Total Bookings",
            value: analytics.totalBookings.toLocaleString(),
            change: formatPercent(analytics.monthlyGrowth),
            footer: "All bookings",
            key: "total-bookings",
        },
        {
            title: "Today's Bookings",
            value: analytics.todayBookings.toLocaleString(),
            change: "Today",
            footer: "Appointments scheduled today",
            key: "today-bookings",
        },
        {
            title: "Monthly Revenue",
            value: formatCurrency(analytics.confirmedRevenue),
            change: formatPercent(analytics.monthlyGrowth),
            footer: "This month's earnings",
            key: "monthly-revenue",
        },
    ];
}

/* ---------- helpers ---------- */

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}

function formatPercent(value: number) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
}
