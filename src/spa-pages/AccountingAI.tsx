import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Send,
  Loader2,
  MessageSquare,
  Trash2,
  Bot,
  Bell,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageChangeDropdown } from "@/components/LanguageChangeDropdown";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatLogic } from "@/hooks/useChatLogic";
import { KnowledgeBaseManager } from "@/components/knowledge-base/KnowledgeBaseManager";
import { Book, Database } from "lucide-react";

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


const AccountingAI = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const orgColors = useOrganizationColors();

  // Get conversation ID from URL state if navigating from floating modal
  const incomingConversationId = location.state?.conversationId;

  // Use shared chat logic hook
  const chatLogic = useChatLogic(incomingConversationId);

  const {
    messages,
    input,
    setInput,
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    isLoadingConversations,
    selectedReport,
    showReportDialog,
    setShowReportDialog,
    reports,
    isLoadingReports,
    isClearingConversations,
    typingMessageId,
    indexingStatuses,
    resetToWelcome,
    handleOpenReportDialog,
    loadConversation,
    handleSend,
    clearConversations,
    handleSelectReport,
  } = chatLogic;

  const [showKbManager, setShowKbManager] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check if we should show the welcome screen (no messages and no active conversation)
  const showWelcomeScreen = messages.length === 0 && !currentConversationId;

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* Header - only show when not in welcome screen */}
        {!showWelcomeScreen && (
          <header className="flex h-[112px] shrink-0 items-center justify-between px-12 bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Bot className="h-10 w-10" style={{ color: orgColors.primary }} />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-1.5">
                  SmartAccount AI
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your account by chatting with AI.
                </p>
              </div>
            </div>

            {/* User actions */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Help
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                API
              </button>
              <LanguageChangeDropdown />
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 rounded-full w-9 h-9"
                style={{
                  backgroundColor: "transparent",
                }}
              >
                <Bell className="h-5 w-5" style={{ color: "#4B5563" }} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#EF4444" }}
                ></span>
              </Button>
              <UserProfile />
            </div>
          </header>
        )}

        {/* Welcome Screen - shown when no conversation is active */}
        {showWelcomeScreen ? (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Chat history sidebar */}
            <aside className="w-72 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
              {/* Sidebar header - fixed at top */}
              <div className="px-5 py-5 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-base font-semibold text-gray-900">
                  Chat History
                </h2>
              </div>

              {/* Conversations list - scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="py-2">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No previous chats
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className="w-full text-left px-5 py-3 hover:bg-gray-50 text-sm transition-colors flex items-start gap-3 text-gray-700 border-l-2 border-transparent hover:border-gray-300"
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="block truncate text-gray-800">
                            {conv.title}
                          </span>
                          <span className="block text-xs text-gray-400 mt-1">
                            {new Date(conv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Clear conversations - fixed at bottom */}
              {conversations.length > 0 && (
                <div className="border-t border-gray-200 px-3 py-3 flex-shrink-0">
                  <button
                    onClick={clearConversations}
                    disabled={isClearingConversations}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-sm transition-colors flex items-center gap-2.5 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClearingConversations ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isClearingConversations ? "Clearing..." : "Clear all chats"}
                  </button>
                </div>
              )}
            </aside>

            {/* Main welcome content */}
            <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
              {/* Top header bar */}
              <header className="flex h-16 shrink-0 items-center justify-end px-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Help
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    API
                  </button>
                  <LanguageChangeDropdown />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-gray-100 rounded-full w-9 h-9"
                    style={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <Bell className="h-5 w-5" style={{ color: "#4B5563" }} />
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#EF4444" }}
                    ></span>
                  </Button>
                  <UserProfile />
                </div>
              </header>

              {/* Welcome content centered */}
              <div className="flex-1 flex flex-col items-center justify-center px-8">
                <div className="w-full max-w-2xl">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
                    What can I help with?
                  </h1>

                  {/* Add PDF button */}
                  <div className="mb-4 flex gap-2 justify-center">
                    <Button
                      onClick={() => setShowKbManager(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Document Library
                    </Button>
                  </div>

                  {/* Input container */}
                  <div className="relative rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center px-5 py-4">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything"
                        className="min-h-[56px] max-h-32 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base flex-1 pr-4 placeholder:text-gray-400"
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
                        className="h-9 w-9 flex-shrink-0 hover:bg-gray-100 rounded-full"
                        onClick={handleSend}
                        disabled={isSending || !input.trim()}
                      >
                        {isSending ? (
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            style={{ color: orgColors.primary }}
                          />
                        ) : (
                          <Send
                            className="h-5 w-5"
                            style={{ color: orgColors.primary }}
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main workspace: left sidebar + right chat area - shown when conversation is active */
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Conversation sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col h-full overflow-hidden">
              {/* New chat button */}
              <div className="p-3 border-b flex-shrink-0">
                <Button
                  onClick={resetToWelcome}
                  disabled={isLoading}
                  className="w-full justify-start gap-2 text-sm font-normal"
                  variant="ghost"
                >
                  <Plus className="h-4 w-4" />
                  New chat
                </Button>
              </div>

              {/* Conversations list - scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-2 space-y-1">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm transition-colors flex items-center gap-2 ${currentConversationId === conv.id
                          ? "bg-gray-100 font-medium"
                          : "text-gray-700"
                          }`}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{conv.title}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Settings section - fixed at bottom */}
              <div className="border-t p-2 space-y-1 flex-shrink-0">
                <button
                  onClick={clearConversations}
                  disabled={isClearingConversations}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm transition-colors flex items-center gap-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearingConversations ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isClearingConversations ? "Clearing..." : "Clear conversations"}
                </button>
              </div>
            </aside>

            {/* Chat panel */}
            <section className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
              {/* Selected Report Banner - fixed at top */}
              {selectedReport && (
                <div className="border-b bg-gray-50 px-8 py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <FileText
                      className="h-5 w-5"
                      style={{ color: orgColors.primary }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedReport.title}
                      </p>
                      {selectedReport.client_name && (
                        <p className="text-xs text-gray-500">
                          {selectedReport.client_name}
                          {selectedReport.period_display &&
                            ` • ${selectedReport.period_display}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenReportDialog}
                    className="gap-2"
                  >
                    Change Report
                  </Button>
                </div>
              )}

              {/* Add Context button in chat view - fixed at top */}
              {!selectedReport && (
                <div className="border-b px-8 py-3 flex-shrink-0 flex gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowKbManager(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Document Library
                    </Button>
                    <Button
                      onClick={handleOpenReportDialog}
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground"
                    >
                      <FileText className="h-4 w-4" />
                      Chat on PDF Report
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    All documents searchable
                  </div>
                </div>
              )}

              {/* Messages area - scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-4xl mx-auto px-8 py-6">
                  {messages.length === 0 ? (
                    <div className="flex flex-col gap-6 pt-8">
                      {/* Empty state can be customized here */}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                          {m.role === "assistant" && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: `${orgColors.primary}20`,
                              }}
                            >
                              <Bot
                                className="h-5 w-5"
                                style={{ color: orgColors.primary }}
                              />
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-4 py-3 max-w-[70%] ${m.role === "user"
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
                        <div className="flex gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${orgColors.primary}20`,
                            }}
                          >
                            <Bot
                              className="h-5 w-5"
                              style={{ color: orgColors.primary }}
                            />
                          </div>
                          <div className="bg-white border rounded-lg px-4 py-3 min-w-[200px]">
                            <AnimatedThinkingText />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Input area - fixed at bottom */}
              <div className="border-t bg-white flex-shrink-0">
                <div className="max-w-4xl mx-auto px-8 py-4">
                  {/* Input box */}
                  <div className="flex items-center gap-3 border rounded-lg bg-white px-4 py-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything"
                      className="min-h-[40px] max-h-32 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleSend}
                        disabled={isSending || !input.trim()}
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <Send className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Report Selection Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select a Report to Chat About</DialogTitle>
              <DialogDescription>
                Choose a report to enable PDF-based chat. The PDF will be
                indexed and you can ask questions about its content.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : reports.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No reports available
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => {
                    const indexingStatus = indexingStatuses[report.id]?.status || report.pdf_indexing_status || "not_indexed";
                    const getStatusBadge = () => {
                      switch (indexingStatus) {
                        case "indexed":
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Indexed
                            </span>
                          );
                        case "indexing":
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Indexing...
                            </span>
                          );
                        case "failed":
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Failed
                            </span>
                          );
                        default:
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Not Indexed
                            </span>
                          );
                      }
                    };

                    return (
                      <button
                        key={report.id}
                        onClick={() => handleSelectReport(report)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {report.title}
                              </p>
                              {getStatusBadge()}
                            </div>
                            {report.client_name && (
                              <p className="text-sm text-gray-500 mt-1">
                                {report.client_name}
                                {report.period_display &&
                                  ` • ${report.period_display}`}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                            {indexingStatus === "failed" && indexingStatuses[report.id]?.error && (
                              <p className="text-xs text-red-600 mt-1">
                                Error: {indexingStatuses[report.id].error}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <KnowledgeBaseManager
          open={showKbManager}
          onOpenChange={setShowKbManager}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AccountingAI;
