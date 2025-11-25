import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Droplet, FileText, UserRound, Calendar, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    
    navigate("/auth");
  };

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/donors", icon: Users, label: "Donors" },
    { to: "/inventory", icon: Droplet, label: "Blood Inventory" },
    { to: "/requests", icon: FileText, label: "Blood Requests" },
    { to: "/patients", icon: UserRound, label: "Patients" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
  ];

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-primary-foreground/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-foreground rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-xl">BloodBank</h1>
            <p className="text-xs opacity-90">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="text-xs font-semibold opacity-70 mb-3 px-3">NAVIGATION</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-foreground/10 text-primary-foreground font-medium"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-primary-foreground/10 space-y-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary-foreground text-primary font-semibold">
              {userEmail.substring(0, 2).toUpperCase() || "BB"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userEmail || "Blood Bank Admin"}</p>
            <p className="text-xs opacity-70 truncate">System Administrator</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
