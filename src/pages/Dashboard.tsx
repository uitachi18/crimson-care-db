import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/StatsCard";
import BloodTypeCard from "@/components/BloodTypeCard";
import { Package, Users, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BloodInventory {
  blood_type: string;
  quantity_ml: number;
}

interface Stats {
  totalUnits: number;
  totalDonors: number;
  pendingRequests: number;
  lowStock: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [bloodInventory, setBloodInventory] = useState<BloodInventory[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch blood inventory grouped by type
    const { data: inventory } = await supabase
      .from("blood_inventory")
      .select("blood_type, quantity_ml")
      .eq("status", "available");

    // Aggregate by blood type
    const aggregated = inventory?.reduce((acc: any, item) => {
      const existing = acc.find((i: any) => i.blood_type === item.blood_type);
      if (existing) {
        existing.quantity_ml += item.quantity_ml;
      } else {
        acc.push({ blood_type: item.blood_type, quantity_ml: item.quantity_ml });
      }
      return acc;
    }, []) || [];

    setBloodInventory(aggregated);

    // Fetch stats
    const { count: donorCount } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true });

    const { count: requestCount } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const totalUnits = aggregated.reduce((sum: number, item: any) => sum + item.quantity_ml, 0);
    const lowStockCount = aggregated.filter((item: any) => item.quantity_ml < 2000).length;

    setStats({
      totalUnits: Math.floor(totalUnits / 1000),
      totalDonors: donorCount || 0,
      pendingRequests: requestCount || 0,
      lowStock: lowStockCount,
    });

    setLoading(false);
  };

  return (
    <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time blood inventory and operations overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Blood Units"
            value={`${stats.totalUnits}L`}
            icon={Package}
            trend="Available inventory"
            colorClass="bg-primary"
          />
          <StatsCard
            title="Registered Donors"
            value={stats.totalDonors}
            icon={Users}
            trend="Active donors"
            colorClass="bg-success"
          />
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={FileText}
            trend="Awaiting fulfillment"
            colorClass="bg-warning"
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStock}
            icon={AlertCircle}
            trend="Types below threshold"
            colorClass="bg-accent"
          />
        </div>

        {/* Blood Type Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Blood Inventory by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bloodInventory
                  .sort((a, b) => a.blood_type.localeCompare(b.blood_type))
                  .map((item) => (
                    <BloodTypeCard
                      key={item.blood_type}
                      bloodType={item.blood_type}
                      quantity={item.quantity_ml}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
    </main>
  );
};

export default Dashboard;
