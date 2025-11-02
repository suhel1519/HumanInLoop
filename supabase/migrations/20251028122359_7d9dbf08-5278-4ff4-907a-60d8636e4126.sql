-- Create help_requests table for tracking AI agent questions
CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  caller_info JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create knowledge_base table for storing learned answers
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_request_id UUID REFERENCES public.help_requests(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supervisor_responses table for tracking supervisor answers
CREATE TABLE public.supervisor_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a supervisor tool)
CREATE POLICY "Allow all access to help_requests" ON public.help_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to knowledge_base" ON public.knowledge_base FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to supervisor_responses" ON public.supervisor_responses FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_help_requests_status ON public.help_requests(status);
CREATE INDEX idx_help_requests_created_at ON public.help_requests(created_at DESC);
CREATE INDEX idx_supervisor_responses_request_id ON public.supervisor_responses(request_id);

-- Create function to update resolved_at timestamp
CREATE OR REPLACE FUNCTION public.update_help_request_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status = 'pending' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_help_request_resolved_at_trigger
BEFORE UPDATE ON public.help_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_help_request_resolved_at();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.knowledge_base;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supervisor_responses;