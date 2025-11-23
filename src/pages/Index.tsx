import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-elevated">
            <Heart className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="text-gradient">Luna Cycle</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4">
          Your Personal Menstruation Tracking Companion
        </p>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Track your cycle, monitor your health, access wellness resources, and take control of your menstrual health journey with care and understanding.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-soft hover:shadow-elevated transition-all"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-2">Track Your Cycle</h3>
            <p className="text-sm text-muted-foreground">
              Easy calendar-based tracking with predictions and insights
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-2">Monitor Health</h3>
            <p className="text-sm text-muted-foreground">
              Record physical data including BP, hemoglobin, and pain levels
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-2">Wellness Resources</h3>
            <p className="text-sm text-muted-foreground">
              Access exercise routines and nutrition guides tailored for you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
