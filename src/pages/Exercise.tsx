import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Dumbbell, ExternalLink } from "lucide-react";

const Exercise = () => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("exercise_videos")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;

      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load exercise videos");
    } finally {
      setLoading(false);
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">
                  <span className="text-gradient">Exercise Videos</span>
                </CardTitle>
                <CardDescription>
                  Recommended workouts for menstrual health
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No exercise videos available at the moment.
              </p>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-soft transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{video.title}</CardTitle>
                      {video.description && (
                        <CardDescription>{video.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(video.youtube_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch on YouTube
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Exercise;
