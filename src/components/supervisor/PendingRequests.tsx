import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Clock, MessageSquare } from "lucide-react";

interface HelpRequest {
  id: string;
  question: string;
  caller_info: any;
  status: string;
  created_at: string;
}

const PendingRequests = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();

    const channel = supabase
      .channel('pending-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: 'status=eq.pending'
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending requests",
        variant: "destructive",
      });
      return;
    }

    setRequests(data || []);
  };

  const handleSubmitAnswer = async (requestId: string) => {
    const answer = answers[requestId]?.trim();
    if (!answer) {
      toast({
        title: "Error",
        description: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setSubmitting(prev => ({ ...prev, [requestId]: true }));

    try {
      // Execute all database operations
      const [responseResult, kbResult, updateResult] = await Promise.all([
        supabase.from('supervisor_responses').insert({ request_id: requestId, answer }),
        supabase.from('knowledge_base').insert({
          question: request.question,
          answer,
          source_request_id: requestId
        }),
        supabase.from('help_requests').update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        }).eq('id', requestId)
      ]);

      // Check for errors
      if (responseResult.error) throw responseResult.error;
      if (kbResult.error) throw kbResult.error;
      if (updateResult.error) throw updateResult.error;

      toast({
        title: "Success",
        description: "Answer submitted and caller notified (simulated)",
      });

      console.log(`📱 SMS Simulation: Sending answer to caller for request ${requestId}: ${answer}`);

      // Clear answer field
      setAnswers(prev => ({ ...prev, [requestId]: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Pending Help Requests</h2>
        <Badge variant="secondary" className="text-sm">
          {requests.length} pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending requests</p>
            <p className="text-sm text-muted-foreground mt-2">
              All caught up! New requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-warning">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Help Request</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(request.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                  Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Question:</h4>
                <p className="text-foreground">{request.question}</p>
              </div>

              {request.caller_info && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Caller Info:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                    {JSON.stringify(request.caller_info, null, 2)}
                  </pre>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Answer:</label>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[request.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [request.id]: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={() => handleSubmitAnswer(request.id)}
                disabled={submitting[request.id]}
                className="w-full"
              >
                {submitting[request.id] ? "Submitting..." : "Submit Answer & Notify Caller"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PendingRequests;