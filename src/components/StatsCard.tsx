import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, colorClass = "bg-primary" }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-sm text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
