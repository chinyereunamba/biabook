import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { TrendingUp, Calendar, Users } from "lucide-react";

export const Stats = ({
  item,
}: {
  item: {
    key: string;
    title: string;
    value: number | string;
    change: string;
    footer: string;
  };
}) => {
  const ICONS = {
    "total-revenue": TrendingUp,
    "total-bookings": Calendar,
    "today-bookings": Users,
    "monthly-revenue": TrendingUp,
  };
  const Icon = ICONS[item.key as keyof typeof ICONS];

  return (
    <Card className="@container/card" key={item.title}>
      <CardHeader>
        <CardDescription>{item.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {item.value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <Icon />
            {item.change}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {/* Trending up this month <TrendingUp className="size-4" /> */}
        </div>
        <div className="text-muted-foreground">{item.footer}</div>
      </CardFooter>
    </Card>
  );
};
