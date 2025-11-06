import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Donor {
  id: string;
  full_name: string;
  blood_type: string;
  email: string | null;
  phone: string;
  date_of_birth: string;
  last_donation_date: string | null;
  eligibility: string;
}

const Donors = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    fetchDonors();
  }, []);

  useEffect(() => {
    const filtered = donors.filter((donor) =>
      donor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm)
    );
    setFilteredDonors(filtered);
  }, [searchTerm, donors]);

  const fetchDonors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("donors")
      .select("*")
      .order("full_name", { ascending: true });

    setDonors(data || []);
    setFilteredDonors(data || []);
    setLoading(false);
  };

  const getEligibilityBadge = (eligibility: string) => {
    switch (eligibility) {
      case "eligible":
        return <Badge className="bg-success text-success-foreground">Eligible</Badge>;
      case "temporarily_ineligible":
        return <Badge variant="secondary">Temporarily Ineligible</Badge>;
      case "permanently_ineligible":
        return <Badge variant="destructive">Permanently Ineligible</Badge>;
      default:
        return <Badge variant="outline">{eligibility}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Donor Management</h1>
          <p className="text-muted-foreground">Complete donor database with history and eligibility tracking</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>All Donors</span>
              </CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, blood type, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading donors...</div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Last Donation</TableHead>
                      <TableHead>Eligibility</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-semibold">{donor.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {donor.blood_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{donor.phone}</span>
                            </div>
                            {donor.email && (
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{donor.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {donor.last_donation_date ? (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(donor.last_donation_date), "MMM dd, yyyy")}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No donations yet</span>
                          )}
                        </TableCell>
                        <TableCell>{getEligibilityBadge(donor.eligibility)}</TableCell>
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

export default Donors;
