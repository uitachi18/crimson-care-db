import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Donor {
  id: string;
  full_name: string;
  phone: string;
}

interface AppointmentDialogProps {
  onAppointmentCreated: () => void;
}

export const AppointmentDialog = ({ onAppointmentCreated }: AppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedDonor, setSelectedDonor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("donation");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDonors();
    }
  }, [open]);

  const fetchDonors = async () => {
    const { data } = await supabase
      .from("donors")
      .select("id, full_name, phone")
      .eq("eligibility", "eligible")
      .order("full_name");
    
    setDonors(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDonor || !appointmentDate || !appointmentTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const [hours, minutes] = appointmentTime.split(":");
    const combinedDateTime = new Date(appointmentDate);
    combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

    const { error } = await supabase
      .from("appointments")
      .insert({
        donor_id: selectedDonor,
        appointment_date: combinedDateTime.toISOString(),
        appointment_type: appointmentType,
        status: "scheduled",
        notes: notes || null,
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Appointment scheduled successfully",
    });

    setOpen(false);
    resetForm();
    onAppointmentCreated();
  };

  const resetForm = () => {
    setSelectedDonor("");
    setAppointmentDate(undefined);
    setAppointmentTime("");
    setAppointmentType("donation");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="donor">Donor *</Label>
            <Select value={selectedDonor} onValueChange={setSelectedDonor}>
              <SelectTrigger id="donor">
                <SelectValue placeholder="Select a donor" />
              </SelectTrigger>
              <SelectContent>
                {donors.map((donor) => (
                  <SelectItem key={donor.id} value={donor.id}>
                    {donor.full_name} - {donor.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Appointment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !appointmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Appointment Time *</Label>
            <Input
              id="time"
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type *</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donation">Donation</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
