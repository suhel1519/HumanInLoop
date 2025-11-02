import AIAgentSimulator from "@/components/ai/AIAgentSimulator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Agent Call Simulator</h1>
            <p className="text-muted-foreground">Test the AI agent's ability to handle questions and request help</p>
          </div>
          <Button onClick={() => navigate('/supervisor')} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Supervisor Dashboard
          </Button>
        </div>

        <AIAgentSimulator />
      </div>
    </div>
  );
};

export default Index;
