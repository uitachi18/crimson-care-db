import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface BloodRequest {
  id: string;
  requester_name: string;
  hospital_name: string;
  blood_type: string;
  quantity_ml: number;
  urgency: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-primary text-primary-foreground">Approved</Badge>;
      case "fulfilled":
        return <Badge className="bg-success text-success-foreground">Fulfilled</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return <Badge className="bg-accent text-accent-foreground">Urgent</Badge>;
      case "high":
        return <Badge className="bg-warning text-warning-foreground">High</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blood Requests</h1>
          <p className="text-muted-foreground">Track and manage all blood requests from hospitals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>All Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{request.hospital_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{request.requester_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {request.blood_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.quantity_ml.toLocaleString()} ml</TableCell>
                        <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(request.created_at), "MMM dd, yyyy")}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Requests;
