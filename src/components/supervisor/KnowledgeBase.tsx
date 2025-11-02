import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search } from "lucide-react";

interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

const KnowledgeBase = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchKnowledgeBase();

    const channel = supabase
      .channel('knowledge-base')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_base'
        },
        () => {
          fetchKnowledgeBase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKnowledgeBase = async () => {
    const { data } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    setKnowledge(data || []);
  };

  const filteredKnowledge = knowledge.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Knowledge Base</h2>
        <Badge variant="secondary" className="text-sm">
          {knowledge.length} learned answers
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredKnowledge.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No matching knowledge found" : "No learned answers yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm ? "Try a different search term" : "Answers will appear here as you resolve requests"}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredKnowledge.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">Q: {item.question}</CardTitle>
              <CardDescription>
                Learned on {new Date(item.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Answer:</h4>
                <p className="text-foreground">{item.answer}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default KnowledgeBase;