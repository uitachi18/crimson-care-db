import { Card, CardContent } from "@/components/ui/card";
import { Droplet } from "lucide-react";

interface BloodTypeCardProps {
  bloodType: string;
  quantity: number;
  unit?: string;
}

const BloodTypeCard = ({ bloodType, quantity, unit = "ml" }: BloodTypeCardProps) => {
  const isLowStock = quantity < 2000;
  const statusColor = isLowStock ? "text-warning" : "text-success";
  const bgColor = isLowStock ? "bg-warning/10" : "bg-success/10";

  return (
    <Card className={`${bgColor} border-2 transition-all hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Droplet className={`w-5 h-5 ${statusColor}`} />
              <h3 className="text-2xl font-bold">{bloodType}</h3>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{quantity.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{unit} available</p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${isLowStock ? 'bg-warning' : 'bg-success'} animate-pulse`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodTypeCard;
