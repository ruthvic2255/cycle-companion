import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Bell } from "lucide-react";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    days_before_period: 3,
    email_notifications: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          days_before_period: data.days_before_period,
          email_notifications: data.email_notifications,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (!userId) return;

      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: userId,
          days_before_period: settings.days_before_period,
          email_notifications: settings.email_notifications,
        });

      if (error) throw error;

      toast.success("Notification settings updated!");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
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
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">
                  <span className="text-gradient">Notifications</span>
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email reminders before your period
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_notifications: checked })
                }
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days-before">Days Before Period</Label>
              <Input
                id="days-before"
                type="number"
                min="1"
                max="14"
                value={settings.days_before_period}
                onChange={(e) =>
                  setSettings({ ...settings, days_before_period: parseInt(e.target.value) || 3 })
                }
                disabled={saving}
              />
              <p className="text-sm text-muted-foreground">
                Receive notification this many days before your expected period
              </p>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Email notifications require cycle tracking data to calculate
                expected period dates. Make sure to regularly update your cycle information in the
                Calendar section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
