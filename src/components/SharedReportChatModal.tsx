import { useState } from "react";
import { X, Send, Loader2, Bot, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildApiUrl } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    bookingLink?: string;
}

interface SharedReportChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: any;
    token: string;
    calendlyLink?: string;
}

export const SharedReportChatModal = ({
    isOpen,
    onClose,
    reportData,
    token,
    calendlyLink,
}: SharedReportChatModalProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        // Add user message to UI immediately
        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content: trimmed,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsSending(true);

        try {
            // Prepare simplified report context
            const reportContext = {
                title: reportData.title,
                period: reportData.period_display,
                client_name: reportData.client_name,
                summary: reportData.summary,
                // Add any other relevant visible data
            };

            const response = await fetch(
                buildApiUrl(`/api/shared-reports/${token}/chat`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: trimmed,
                        report_data: reportContext,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get response from AI");
            }

            const data = await response.json();
            const aiMessage: Message = {
                id: Date.now() + 1,
                role: "assistant",
                content: data.response || "I apologize, but I couldn't process your request.",
                bookingLink: data.booking_link || undefined,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({
                title: "Error",
                description: "Failed to get response. Please try again.",
                variant: "destructive",
            });
            // Remove the user message on error
            setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        // Clear messages when closing
        setMessages([]);
        setInput("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-gray-700" />
                        <h3 className="font-semibold text-gray-900">Report Assistant</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClose}
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <Bot className="h-12 w-12 mb-4 text-gray-300" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                Ask about this report
                            </h4>
                            <p className="text-sm text-gray-500">
                                I can help you understand the data in this financial report
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div key={m.id}>
                                    <div
                                        className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        {m.role === "assistant" && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                                                <Bot className="h-4 w-4 text-gray-600" />
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-lg px-3 py-2 max-w-[75%] ${m.role === "user"
                                                    ? "text-white"
                                                    : "bg-gray-100 border border-gray-200"
                                                }`}
                                            style={m.role === "user" ? {
                                                backgroundColor: 'var(--primary-color, #125390)'
                                            } : undefined}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                        </div>
                                    </div>
                                    {m.role === "assistant" && m.bookingLink && (
                                        <div className="flex gap-2 mt-2">
                                            <div className="w-7 flex-shrink-0" />
                                            <Button
                                                onClick={() => window.open(m.bookingLink, "_blank")}
                                                size="sm"
                                                className="gap-2 text-white"
                                                style={{
                                                    backgroundColor: 'var(--primary-color, #125390)',
                                                    borderColor: 'var(--primary-color, #125390)'
                                                }}
                                            >
                                                <Calendar className="h-4 w-4" />
                                                Book a Call with Accountant
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100">
                                        <Bot className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 min-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                                            <span className="text-sm text-gray-600">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t bg-white p-3">
                    <div className="flex items-center gap-2 border rounded-lg bg-white px-3 py-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about the report..."
                            className="min-h-[40px] max-h-24 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm flex-1 p-0"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={handleSend}
                            disabled={isSending || !input.trim()}
                        >
                            {isSending ? (
                                <Loader2
                                    className="h-4 w-4 animate-spin"
                                    style={{ color: 'var(--primary-color, #125390)' }}
                                />
                            ) : (
                                <Send
                                    className="h-4 w-4"
                                    style={{ color: 'var(--primary-color, #125390)' }}
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
