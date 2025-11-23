import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Utensils, ExternalLink, Apple } from "lucide-react";

const Nutrition = () => {
  const [loading, setLoading] = useState(true);
  const [foodVideos, setFoodVideos] = useState<any[]>([]);
  const [suggestedFoods, setSuggestedFoods] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [videosResult, foodsResult] = await Promise.all([
        supabase
          .from("food_videos")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("suggested_foods")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
      ]);

      if (videosResult.error) throw videosResult.error;
      if (foodsResult.error) throw foodsResult.error;

      setFoodVideos(videosResult.data || []);
      setSuggestedFoods(foodsResult.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load nutrition data");
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
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">
                  <span className="text-gradient">Nutrition Guide</span>
                </CardTitle>
                <CardDescription>
                  Foods and nutrition tips for menstrual health
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="foods" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="foods">Suggested Foods</TabsTrigger>
                <TabsTrigger value="videos">Food Videos</TabsTrigger>
              </TabsList>

              <TabsContent value="foods" className="space-y-4 mt-6">
                {suggestedFoods.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No suggested foods available at the moment.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {suggestedFoods.map((food) => (
                      <Card key={food.id} className="hover:shadow-soft transition-shadow">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                              <Apple className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{food.name}</CardTitle>
                              {food.category && (
                                <p className="text-sm text-muted-foreground">{food.category}</p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {(food.description || food.benefits) && (
                          <CardContent className="space-y-2">
                            {food.description && (
                              <p className="text-sm">{food.description}</p>
                            )}
                            {food.benefits && (
                              <p className="text-sm text-secondary">
                                <strong>Benefits:</strong> {food.benefits}
                              </p>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-4 mt-6">
                {foodVideos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No food videos available at the moment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {foodVideos.map((video) => (
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Nutrition;
