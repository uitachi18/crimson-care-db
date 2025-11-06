import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Droplets, Home, Package, Users, FileText, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Blood Bank</span>
            </div>

            <div className="hidden md:flex space-x-1">
              <NavLink
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="bg-secondary text-foreground"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/inventory"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="bg-secondary text-foreground"
              >
                <Package className="w-4 h-4" />
                <span>Inventory</span>
              </NavLink>

              <NavLink
                to="/donors"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="bg-secondary text-foreground"
              >
                <Users className="w-4 h-4" />
                <span>Donors</span>
              </NavLink>

              <NavLink
                to="/requests"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="bg-secondary text-foreground"
              >
                <FileText className="w-4 h-4" />
                <span>Requests</span>
              </NavLink>
            </div>
          </div>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
