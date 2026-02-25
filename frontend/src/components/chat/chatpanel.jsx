import { useState } from "react";
import { X, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: "1", sender: "Alice", text: "Hey, let's work on the wireframes!", time: "10:30", isMe: false },
  { id: "2", sender: "You", text: "Sure! I'll start with the header section.", time: "10:31", isMe: true },
  { id: "3", sender: "Alice", text: "Sounds good 👍", time: "10:31", isMe: false },
];

interface ChatPanelProps {
  onClose: () => void;
}

const ChatPanel = ({ onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "You",
        text: input,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    ]);
    setInput("");
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full border-l border-border bg-card flex flex-col shrink-0 overflow-hidden"
    >
      <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-display font-semibold">Chat</span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
            {!msg.isMe && (
              <span className="text-xs text-muted-foreground mb-0.5">{msg.sender}</span>
            )}
            <div
              className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">{msg.time}</span>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </motion.div>
  );
};

export default ChatPanel;
