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
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsLoading(true); // Set isLoading to true on mutation start
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
      } finally {
        setIsLoading(false); // Set isLoading to false regardless of success or failure
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
                className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 relative group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💭😉</span>
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-pink-900 to-purple-900 border-pink-500/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  Intimate AI Chat
                </DialogTitle>
                <DialogDescription className="text-pink-100/80">
                  Ask questions and get advice about intimate topics in a safe, private environment. 
                  Your conversations are completely confidential.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 px-4 py-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-2xl p-4 max-w-[80%] shadow-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                              : 'bg-gradient-to-r from-purple-800 to-purple-900 text-pink-100'
                          } transition-all duration-300 hover:scale-[1.02]`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.role === 'user' ? 'You' : 'AI'} • {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {sendMessageMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-purple-800/50 rounded-2xl p-4 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-pink-500/30 bg-gradient-to-r from-pink-900/50 to-purple-900/50">
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                      {['Tell me about relationships', 'Help with intimacy', 'Dating advice'].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(suggestion)}
                          className="whitespace-nowrap bg-white/5 hover:bg-white/10 border-pink-500/30"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                    <form onSubmit={(e) => {e.preventDefault(); handleSend();}} className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/5 border-pink-500/30 placeholder:text-pink-200/50"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          'Send'
                        )}
                      </Button>
                    </form>
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