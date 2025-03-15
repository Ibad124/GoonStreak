import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Suggestion {
  id: number;
  content: string;
  category: string;
  createdAt: string;
  rating: number | null;
}

export function AiSuggestions() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: suggestions, isLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const res = await fetch("/api/suggestions/generate", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate suggestion");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "New suggestion generated!",
        description: "Check out your personalized growth recommendation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => setIsGenerating(false),
  });

  const rateMutation = useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      const res = await fetch(`/api/suggestions/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to rate suggestion");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to rate suggestion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Growth Suggestions</h2>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate New Suggestion
        </Button>
      </div>

      <div className="grid gap-4">
        {suggestions?.map((suggestion) => (
          <Card key={suggestion.id} className="p-6">
            <p className="text-lg mb-4">{suggestion.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {new Date(suggestion.createdAt).toLocaleDateString()}
              </span>
              {suggestion.rating === null && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rateMutation.mutate({ id: suggestion.id, rating: 5 })}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rateMutation.mutate({ id: suggestion.id, rating: 1 })}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
