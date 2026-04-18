import { useState, useEffect } from "react";
import { X, Maximize2, Send, Loader2, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import { useChatLogic, ChatMessage } from "@/hooks/useChatLogic";
import { useNavigate } from "react-router-dom";

// Animated thinking text component
const AnimatedThinkingText = () => {
    const messages = [
        "Thinking...",
        "Analyzing your request...",
        "Processing data...",
        "Preparing response...",
        "Gathering insights...",
        "Reviewing information...",
        "Finalizing details...",
        "Crafting answer...",
        "Almost there...",
        "Just a moment...",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-5 overflow-hidden">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out text-sm text-gray-400 ${index === currentIndex
                            ? "translate-y-0 opacity-100"
                            : index === (currentIndex - 1 + messages.length) % messages.length
                                ? "-translate-y-full opacity-0"
                                : "translate-y-full opacity-0"
                        }`}
                >
                    {message}
                </div>
            ))}
        </div>
    );
};

// Typewriter effect component for AI responses
const TypewriterText = ({ text, speed = 20 }: { text: string; speed?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    // Reset when text changes
    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
    }, [text]);

    return (
        <span className="whitespace-pre-wrap">
            {displayedText}
            {currentIndex < text.length && (
                <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
            )}
        </span>
    );
};

interface FloatingChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId?: number | null;
}

export const FloatingChatModal = ({ isOpen, onClose, conversationId }: FloatingChatModalProps) => {
    const orgColors = useOrganizationColors();
    const navigate = useNavigate();
    const chatLogic = useChatLogic(conversationId);

    const {
        messages,
        input,
        setInput,
        isSending,
        typingMessageId,
        handleSend,
        currentConversationId,
    } = chatLogic;

    const handleExpand = () => {
        // Navigate to full AccountingAI page with current conversation
        if (currentConversationId) {
            navigate("/accounting-ai", { state: { conversationId: currentConversationId } });
        } else {
            navigate("/accounting-ai");
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ backgroundColor: `${orgColors.primary}10` }}
                >
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5" style={{ color: orgColors.primary }} />
                        <h3 className="font-semibold text-gray-900">SmartAccount AI</h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleExpand}
                            title="Expand to full page"
                        >
                            <Maximize2 className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <Bot className="h-12 w-12 mb-4" style={{ color: orgColors.primary, opacity: 0.3 }} />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                What can I help with?
                            </h4>
                            <p className="text-sm text-gray-500">
                                Ask me anything about your accounting
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {m.role === "assistant" && (
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: `${orgColors.primary}20`,
                                            }}
                                        >
                                            <Bot
                                                className="h-4 w-4"
                                                style={{ color: orgColors.primary }}
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-lg px-3 py-2 max-w-[75%] ${m.role === "user"
                                                ? "text-white"
                                                : "bg-white border"
                                            }`}
                                        style={
                                            m.role === "user"
                                                ? { backgroundColor: orgColors.primary }
                                                : undefined
                                        }
                                    >
                                        <p className="text-sm">
                                            {m.role === "assistant" && m.id === typingMessageId ? (
                                                <TypewriterText text={m.content} speed={20} />
                                            ) : (
                                                <span className="whitespace-pre-wrap">{m.content}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: `${orgColors.primary}20`,
                                        }}
                                    >
                                        <Bot
                                            className="h-4 w-4"
                                            style={{ color: orgColors.primary }}
                                        />
                                    </div>
                                    <div className="bg-white border rounded-lg px-3 py-2 min-w-[150px]">
                                        <AnimatedThinkingText />
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
                            placeholder="Ask me anything..."
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
                                    style={{ color: orgColors.primary }}
                                />
                            ) : (
                                <Send
                                    className="h-4 w-4"
                                    style={{ color: orgColors.primary }}
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
