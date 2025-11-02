import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Phone, PhoneOff, Send } from "lucide-react";

// AI knowledge base for salon questions
const SALON_KNOWLEDGE = {
  "hours": "We're open Monday-Saturday, 9 AM to 7 PM. Closed on Sundays.",
  "services": "We offer haircuts, coloring, styling, manicures, pedicures, and facial treatments.",
  "haircut": "Haircuts start at $45 for women and $35 for men.",
  "walk-ins": "We accept walk-ins based on availability, but we recommend booking an appointment.",
} as const;

const AIAgentSimulator = () => {
  const [isActive, setIsActive] = useState(false);
  const [callerQuestion, setCallerQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: string; message: string }>>([]);
  const { toast } = useToast();

  const handleStartCall = () => {
    setIsActive(true);
    setConversation([
      { role: "agent", message: "Hello! Thank you for calling Beauty Salon. How can I help you today?" }
    ]);
    toast({
      title: "Call Started",
      description: "AI Agent is now active",
    });
  };

  const handleEndCall = () => {
    setIsActive(false);
    setConversation([]);
    setCallerQuestion("");
    toast({
      title: "Call Ended",
      description: "AI Agent conversation closed",
    });
  };

  const findKnownAnswer = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    for (const [key, answer] of Object.entries(SALON_KNOWLEDGE)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }
    return null;
  };

  const handleAskQuestion = async () => {
    const trimmedQuestion = callerQuestion.trim();
    if (!trimmedQuestion) return;

    // Add caller question to conversation
    const newConversation = [...conversation, { role: "caller", message: trimmedQuestion }];
    setConversation(newConversation);

    // Check if AI knows the answer
    const knownAnswer = findKnownAnswer(trimmedQuestion);

    if (knownAnswer) {
      // AI knows the answer
      setTimeout(() => {
        setConversation(prev => [...prev, { role: "agent", message: knownAnswer }]);
      }, 500);
    } else {
      // AI doesn't know - request help
      setTimeout(async () => {
        setConversation(prev => [
          ...prev,
          { role: "agent", message: "Let me check with my supervisor and get back to you." }
        ]);

        try {
          const { error } = await supabase
            .from('help_requests')
            .insert({
              question: trimmedQuestion,
              caller_info: { timestamp: new Date().toISOString(), simulated: true },
              status: 'pending'
            });

          if (error) throw error;

          toast({
            title: "Help Requested",
            description: "Question sent to supervisor",
          });

          console.log("📱 SMS Simulation: Notifying supervisor about new help request");
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create help request",
            variant: "destructive",
          });
        }
      }, 500);
    }

    setCallerQuestion("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          AI Agent Simulator
        </CardTitle>
        <CardDescription>
          Simulates an AI agent handling customer calls for Beauty Salon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <div className="text-center py-8">
            <Button onClick={handleStartCall} size="lg" className="gap-2">
              <Phone className="h-4 w-4" />
              Start Simulated Call
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'caller' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'caller'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-card-foreground border'
                      }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {msg.role === 'caller' ? 'Caller' : 'AI Agent'}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ask a question as the caller..."
                value={callerQuestion}
                onChange={(e) => setCallerQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button onClick={handleAskQuestion} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleEndCall}
              variant="destructive"
              className="w-full gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAgentSimulator;