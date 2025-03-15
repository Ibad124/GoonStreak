import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export function SexAiChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        const response = await fetch('/api/chat/sex-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: content }),
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(contentType?.includes("json") ? JSON.parse(errorText).error : errorText);
        }

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format from server");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.message,
          role: "assistant",
          timestamp: response.timestamp || new Date().toISOString()
        }
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    sendMessageMutation.mutate(input);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        <motion.div
          className="fixed bottom-24 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Heart className="w-8 h-8 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Intimate AI Chat
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Ask questions and get advice about intimate topics in a safe, private environment.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card
                        key={message.id}
                        className={`p-4 ${
                          message.role === "user"
                            ? "ml-12 bg-blue-600 text-white"
                            : "mr-12 bg-slate-700 text-slate-100"
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70 block mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </Card>
                    ))}
                    {sendMessageMutation.isPending && (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your message..."
                      disabled={sendMessageMutation.isPending}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sendMessageMutation.isPending || !input.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </AnimatePresence>
    </>
  );
}