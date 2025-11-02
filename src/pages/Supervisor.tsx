import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingRequests from "@/components/supervisor/PendingRequests";
import RequestHistory from "@/components/supervisor/RequestHistory";
import KnowledgeBase from "@/components/supervisor/KnowledgeBase";
import { Users, History, BookOpen } from "lucide-react";

const Supervisor = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">AI Agent Supervisor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage help requests and knowledge base</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <PendingRequests />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <RequestHistory />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <KnowledgeBase />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Supervisor;