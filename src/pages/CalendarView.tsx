import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const cycleSchema = z.object({
  start_date: z.string(),
  end_date: z.string().optional(),
});

const CalendarView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({
    start_date: "",
    end_date: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("menstrual_cycles")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;

      setCycles(data || []);
      
      // Mark cycle dates on calendar
      const dates: Date[] = [];
      data?.forEach(cycle => {
        const start = new Date(cycle.start_date);
        const end = cycle.end_date ? new Date(cycle.end_date) : start;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
      });
      setSelectedDates(dates);
    } catch (error) {
      console.error("Error loading cycles:", error);
      toast.error("Failed to load cycle data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!userId) return;

      const validated = cycleSchema.parse(newCycle);

      const { error } = await supabase
        .from("menstrual_cycles")
        .insert({
          user_id: userId,
          start_date: validated.start_date,
          end_date: validated.end_date || null,
        });

      if (error) throw error;

      toast.success("Cycle recorded successfully!");
      setDialogOpen(false);
      setNewCycle({ start_date: "", end_date: "" });
      loadData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to record cycle");
        console.error(error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="animate-fade-in shadow-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl">
                    <span className="text-gradient">Cycle Calendar</span>
                  </CardTitle>
                  <CardDescription>Track your menstrual cycle dates</CardDescription>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Cycle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record New Cycle</DialogTitle>
                    <DialogDescription>
                      Add your cycle start and end dates
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCycle} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start">Start Date *</Label>
                      <Input
                        id="start"
                        type="date"
                        value={newCycle.start_date}
                        onChange={(e) => setNewCycle({ ...newCycle, start_date: e.target.value })}
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end">End Date</Label>
                      <Input
                        id="end"
                        type="date"
                        value={newCycle.end_date}
                        onChange={(e) => setNewCycle({ ...newCycle, end_date: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Saving..." : "Save Cycle"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Cycles</h3>
              {cycles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No cycles recorded yet. Add your first cycle to get started!
                </p>
              ) : (
                <div className="space-y-2">
                  {cycles.slice(0, 5).map((cycle) => (
                    <div
                      key={cycle.id}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(cycle.start_date).toLocaleDateString()}
                          {cycle.end_date && ` - ${new Date(cycle.end_date).toLocaleDateString()}`}
                        </p>
                        {cycle.cycle_length && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {cycle.cycle_length} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
