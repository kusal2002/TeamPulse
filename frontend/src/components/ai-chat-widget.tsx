import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SparklesIcon,
  XIcon,
  ArrowUpIcon,
  BotIcon,
  UserIcon,
  Loader2Icon,
  RotateCwIcon,
  Maximize2Icon,
  Minimize2Icon,
  PlusIcon,
  FileTextIcon,
  AlertTriangleIcon,
  FolderIcon,
  SparkleIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "assistant",
    text: "Hello! I am your **TeamPulse AI Assistant**, powered by **Laguna-S 2.1** (OpenRouter). How can I help you analyze weekly team reports, open blockers, or project progress today?",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendPrompt = async (textToSend?: string) => {
    const text = (textToSend || promptInput).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/chat", { prompt: text });
      const aiReply =
        res.data?.response ||
        "I couldn't generate a response. Please try again.";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error("Failed to connect to AI Assistant");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "⚠️ Sorry, I encountered an error connecting to the AI service. Please verify your connection or try again shortly.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setPromptInput("");
    toast.info("Chat conversation reset");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Icon Trigger Button when collapsed */}
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          size="lg"
          className="group relative size-14 rounded-full bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-primary-foreground shadow-2xl hover:shadow-primary/20 hover:scale-110 transition-all duration-300 p-0 border-2 border-white/20 cursor-pointer"
        >
          <SparklesIcon className="size-6 animate-pulse" />
          <span className="sr-only">Open AI Chat</span>
          <span className="absolute -top-1 -right-1 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
          </span>
        </Button>
      )}

      {/* Expanded Shadcn Chat Card */}
      {isOpen && (
        <Card
          className={`shadow-2xl border bg-background/95 backdrop-blur-md flex flex-col transition-all duration-300 overflow-hidden ${
            isExpanded
              ? "w-[94vw] md:w-[720px] h-[84vh]"
              : "w-[94vw] sm:w-[440px] h-[580px]"
          }`}
        >
          {/* Card Header */}
          <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 flex items-center justify-center text-primary-foreground shadow-xs">
                <SparklesIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  TeamPulse AI Assistant
                </CardTitle>
                <CardDescription className="text-xs">
                  Executive Q&A & team report analysis
                </CardDescription>
              </div>
            </div>

            {/* Actions: Reset, Expand, Close */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
                title="Reset conversation"
                disabled={isLoading}
              >
                <RotateCwIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2Icon className="size-4" />
                ) : (
                  <Maximize2Icon className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Card Content - Message Thread */}
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border text-muted-foreground"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <UserIcon className="size-4" />
                  ) : (
                    <BotIcon className="size-4 text-primary" />
                  )}
                </div>

                <div
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                        : "bg-muted/40 border text-foreground rounded-tl-none"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-sm font-bold mt-2 mb-1 border-b pb-1">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold mt-2 mb-1">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold mt-2 mb-1 text-primary">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0 leading-relaxed">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong
                            className={`font-bold ${msg.sender === "user" ? "text-primary-foreground font-semibold" : "text-foreground font-bold"}`}
                          >
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 my-1 space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 my-1 space-y-0.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code
                            className={`px-1 py-0.5 rounded font-mono text-[11px] ${msg.sender === "user" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground font-semibold"}`}
                          >
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary/50 pl-2 italic text-muted-foreground my-1">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2">
                            <table className="w-full text-left border-collapse text-[11px]">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border-b bg-muted/50 px-2 py-1 font-bold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b px-2 py-1">{children}</td>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground p-1">
                <div className="size-8 rounded-full bg-muted border flex items-center justify-center">
                  <BotIcon className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-2xl border text-xs">
                  <Loader2Icon className="size-4 animate-spin text-primary" />
                  <span>Synthesizing report data with AI...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Card Footer - Input Area */}
          <CardFooter className="p-3 border-t bg-background shrink-0 flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="w-full flex items-center gap-2"
            >
              {/* Quick Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                      title="Quick Prompts"
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" side="top" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      handleSendPrompt("Summarize team activity for this week")
                    }
                  >
                    <FileTextIcon className="size-4 mr-2 text-blue-500" />
                    Summarize Weekly Activity
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleSendPrompt(
                        "What are the major open blockers across the team?",
                      )
                    }
                  >
                    <AlertTriangleIcon className="size-4 mr-2 text-destructive" />
                    Check Open Blockers
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleSendPrompt("Which projects have pending reviews?")
                    }
                  >
                    <FolderIcon className="size-4 mr-2 text-amber-500" />
                    Pending Project Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleSendPrompt(
                        "Generate a highlights report for key achievements",
                      )
                    }
                  >
                    <SparkleIcon className="size-4 mr-2 text-emerald-500" />
                    Key Achievements Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Prompt Input */}
              <Input
                placeholder="Ask AI about team activity, blockers..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                disabled={isLoading}
                className="h-9 text-xs flex-1"
              />

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !promptInput.trim()}
                className="size-9 shrink-0"
                title="Send Message"
              >
                {isLoading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
