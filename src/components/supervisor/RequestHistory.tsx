import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, History as HistoryIcon } from "lucide-react";

interface HelpRequest {
  id: string;
  question: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  supervisor_responses: Array<{
    answer: string;
    created_at: string;
  }>;
}

const RequestHistory = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  useEffect(() => {
    fetchRequestHistory();

    const channel = supabase
      .channel('request-history')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'help_requests'
        },
        () => {
          fetchRequestHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequestHistory = async () => {
    const { data } = await supabase
      .from('help_requests')
      .select(`
        *,
        supervisor_responses (
          answer,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    setRequests(data || []);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Request History</h2>
        <Badge variant="secondary" className="text-sm">
          {requests.length} total
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No request history yet</p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Request</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(request.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge
                  variant={request.status === 'resolved' ? 'default' : 'outline'}
                  className={request.status === 'resolved' ? 'bg-success' : 'bg-warning/10 text-warning border-warning'}
                >
                  {request.status === 'resolved' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolved
                    </>
                  ) : (
                    'Pending'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Question:</h4>
                <p className="text-foreground">{request.question}</p>
              </div>

              {request.supervisor_responses && request.supervisor_responses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Answer:</h4>
                  <div className="bg-success/10 border border-success/20 rounded-md p-4">
                    <p className="text-foreground">{request.supervisor_responses[0].answer}</p>
                  </div>
                </div>
              )}

              {request.resolved_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolved at {new Date(request.resolved_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default RequestHistory;