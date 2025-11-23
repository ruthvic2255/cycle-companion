import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Activity } from "lucide-react";
import { z } from "zod";

const physicalDataSchema = z.object({
  height_cm: z.number().positive().optional(),
  weight_kg: z.number().positive().optional(),
  hemoglobin_level: z.number().positive().optional(),
  blood_pressure_systolic: z.number().int().positive().optional(),
  blood_pressure_diastolic: z.number().int().positive().optional(),
  pain_level: z.enum(["low", "medium", "high"]).optional(),
});

const PhysicalData = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [latestData, setLatestData] = useState<any>(null);
  const [formData, setFormData] = useState({
    height_cm: "",
    weight_kg: "",
    hemoglobin_level: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    pain_level: "",
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
        .from("physical_data")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setLatestData(data);
        setFormData({
          height_cm: data.height_cm?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          hemoglobin_level: data.hemoglobin_level?.toString() || "",
          blood_pressure_systolic: data.blood_pressure_systolic?.toString() || "",
          blood_pressure_diastolic: data.blood_pressure_diastolic?.toString() || "",
          pain_level: data.pain_level || "",
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load physical data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!userId) return;

      const dataToValidate = {
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        hemoglobin_level: formData.hemoglobin_level ? parseFloat(formData.hemoglobin_level) : undefined,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined,
        pain_level: formData.pain_level || undefined,
      };

      const validated = physicalDataSchema.parse(dataToValidate);

      const { error } = await supabase
        .from("physical_data")
        .insert({
          user_id: userId,
          ...validated,
        });

      if (error) throw error;

      toast.success("Physical data recorded successfully!");
      loadData();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to save physical data");
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
      <div className="container mx-auto max-w-2xl py-8">
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-3xl">
                <span className="text-gradient">Physical Data</span>
              </CardTitle>
            </div>
            <CardDescription>
              Track your health metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 165.5"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 58.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hb">Hemoglobin Level (g/dL)</Label>
                  <Input
                    id="hb"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 12.5"
                    value={formData.hemoglobin_level}
                    onChange={(e) => setFormData({ ...formData, hemoglobin_level: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pain Level</Label>
                  <Select
                    value={formData.pain_level}
                    onValueChange={(value) => setFormData({ ...formData, pain_level: value })}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pain level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bp-systolic">BP Systolic (mmHg)</Label>
                  <Input
                    id="bp-systolic"
                    type="number"
                    placeholder="e.g., 120"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bp-diastolic">BP Diastolic (mmHg)</Label>
                  <Input
                    id="bp-diastolic"
                    type="number"
                    placeholder="e.g., 80"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Recording..." : "Record Data"}
              </Button>
            </form>

            {latestData && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Last recorded: {new Date(latestData.recorded_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysicalData;
