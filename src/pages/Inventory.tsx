import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Droplet, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface InventoryItem {
  id: string;
  blood_type: string;
  quantity_ml: number;
  collection_date: string;
  expiry_date: string;
  status: string;
}

const Inventory = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blood_inventory")
      .select("*")
      .order("expiry_date", { ascending: true });

    setInventory(data || []);
    setLoading(false);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days <= 7) return { label: "Critical", variant: "destructive" as const };
    if (days <= 14) return { label: "Warning", variant: "default" as const };
    return { label: "Good", variant: "default" as const };
  };

  return (
    <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blood Inventory</h1>
          <p className="text-muted-foreground">Complete blood stock management and tracking</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplet className="w-5 h-5" />
              <span>All Blood Units</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading inventory...</div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Collection Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => {
                      const expiryStatus = getExpiryStatus(item.expiry_date);
                      const daysLeft = getDaysUntilExpiry(item.expiry_date);

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold">
                            <div className="flex items-center space-x-2">
                              <Droplet className="w-4 h-4 text-accent" />
                              <span>{item.blood_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity_ml.toLocaleString()} ml</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(item.collection_date), "MMM dd, yyyy")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(item.expiry_date), "MMM dd, yyyy")}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={daysLeft <= 7 ? "font-semibold text-destructive" : ""}>
                              {daysLeft} days
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </main>
  );
};

export default Inventory;
