import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall, API_ENDPOINTS, buildApiUrl, getAuthHeaders } from "@/lib/api";

export type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    created_at?: string;
};

export type Conversation = {
    id: number;
    title: string;
    created_at: string;
    last_message_at?: string;
    context_report_id?: number;
};

export type Report = {
    id: number;
    title: string;
    client_name?: string;
    period_display?: string;
    created_at: string;
    status: string;
    pdf_indexing_status?: "not_indexed" | "indexing" | "indexed" | "failed";
    pdf_indexing_error?: string;
};

export type KnowledgeBaseDocument = {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    indexing_status: "not_indexed" | "indexing" | "indexed" | "failed";
    indexing_error?: string;
    chunk_count: number;
};

export type KnowledgeBase = {
    id: number;
    name: string;
    description?: string;
    documents: KnowledgeBaseDocument[];
    created_at: string;
};

export const useChatLogic = (initialConversationId?: number | null) => {
    const navigate = useNavigate();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(
        initialConversationId || null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    // Legacy Report State
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Knowledge Base State
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
    const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false);

    const [isClearingConversations, setIsClearingConversations] = useState(false);
    const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
    const [indexingStatuses, setIndexingStatuses] = useState<
        Record<number, { status: string; error?: string; chunk_count?: number }>
    >({});

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Load specific conversation if initialConversationId is provided
    useEffect(() => {
        if (initialConversationId) {
            loadConversation(initialConversationId);
        }
    }, [initialConversationId]);

    const loadConversations = async () => {
        try {
            setIsLoadingConversations(true);
            const response = await apiCall(API_ENDPOINTS.chatConversations);
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const resetToWelcome = () => {
        setCurrentConversationId(null);
        setMessages([]);
        setSelectedReport(null);
    };

    const loadKnowledgeBases = async () => {
        try {
            setIsLoadingKnowledgeBases(true);
            const response = await apiCall(API_ENDPOINTS.knowledgeBases);
            if (response.ok) {
                const data = await response.json();
                setKnowledgeBases(data.knowledge_bases || []);
            }
        } catch (error) {
            console.error("Failed to load knowledge bases:", error);
        } finally {
            setIsLoadingKnowledgeBases(false);
        }
    };

    const handleSelectKnowledgeBase = async (kb: KnowledgeBase) => {
        try {
            setIsLoading(true);

            // Create conversation with KB context
            const response = await apiCall(API_ENDPOINTS.chatConversations, {
                method: "POST",
                body: JSON.stringify({
                    title: `Chat with ${kb.name}`,
                    context_type: "knowledge_base",
                    context_knowledge_base_id: kb.id
                }),
            });

            if (response.ok) {
                const conversation = await response.json();
                setCurrentConversationId(conversation.id);
                setSelectedKnowledgeBase(kb);
                // Clear legacy report selection
                setSelectedReport(null);
                setMessages([]);
                await loadConversations();
            }
        } catch (error) {
            console.error("Failed to select knowledge base:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy function for report loading
    const loadReports = async () => {
        try {
            setIsLoadingReports(true);
            const response = await fetch(buildApiUrl(API_ENDPOINTS.reports), {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                const reportsList = data.reports || [];
                setReports(reportsList);

                // Load indexing statuses for all reports
                const statusPromises = reportsList.map(async (report: Report) => {
                    try {
                        const statusResponse = await apiCall(
                            API_ENDPOINTS.reportIndexingStatus(report.id)
                        );
                        if (statusResponse.ok) {
                            const statusData = await statusResponse.json();
                            return { reportId: report.id, status: statusData };
                        }
                    } catch (error) {
                        console.warn(`Failed to get indexing status for report ${report.id}:`, error);
                    }
                    return null;
                });

                const statuses = await Promise.all(statusPromises);
                const statusMap: Record<number, { status: string; error?: string; chunk_count?: number }> = {};
                statuses.forEach((status) => {
                    if (status) {
                        statusMap[status.reportId] = {
                            status: status.status.pdf_indexing_status,
                            error: status.status.error,
                            chunk_count: status.status.chunk_count,
                        };
                    }
                });
                setIndexingStatuses(statusMap);
            }
        } catch (error) {
            console.error("Failed to load reports:", error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const checkIndexingStatus = async (reportId: number) => {
        try {
            const response = await apiCall(API_ENDPOINTS.reportIndexingStatus(reportId));
            if (response.ok) {
                const data = await response.json();
                setIndexingStatuses((prev) => ({
                    ...prev,
                    [reportId]: {
                        status: data.pdf_indexing_status,
                        error: data.error,
                        chunk_count: data.chunk_count,
                    },
                }));
                return data.pdf_indexing_status;
            }
        } catch (error) {
            console.warn(`Failed to check indexing status for report ${reportId}:`, error);
        }
        return null;
    };

    const loadSelectedReport = async (reportId: number) => {
        try {
            const response = await fetch(
                buildApiUrl(`${API_ENDPOINTS.reports}/${reportId}`),
                {
                    headers: getAuthHeaders(),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSelectedReport({
                    id: data.id,
                    title: data.title,
                    client_name: data.client_name,
                    period_display: data.period_display,
                    created_at: data.created_at,
                    status: data.status,
                });
            }
        } catch (error) {
            console.error("Failed to load report:", error);
        }
    };

    const handleSelectReport = async (report: Report) => {
        try {
            setIsLoading(true);

            // Check current indexing status (real-time from Pinecone)
            const currentStatus = indexingStatuses[report.id]?.status;

            // If status is unknown or not indexed, trigger indexing
            if (!currentStatus || currentStatus === "not_indexed") {
                try {
                    // Update status to indexing (optimistic)
                    setIndexingStatuses((prev) => ({
                        ...prev,
                        [report.id]: { status: "indexing" },
                    }));

                    // Start indexing in background
                    apiCall(API_ENDPOINTS.reportIndexPdf(report.id), {
                        method: "POST",
                    }).catch((error) => {
                        console.warn("PDF indexing may have failed (non-critical):", error);
                        setIndexingStatuses((prev) => ({
                            ...prev,
                            [report.id]: { status: "not_indexed", error: String(error) },
                        }));
                    });

                    // Poll for status update
                    const pollStatus = async () => {
                        let attempts = 0;
                        const maxAttempts = 30; // Poll for up to 30 seconds
                        const interval = setInterval(async () => {
                            attempts++;
                            const status = await checkIndexingStatus(report.id);
                            if (status === "indexed" || attempts >= maxAttempts) {
                                clearInterval(interval);
                            }
                        }, 1000);
                    };
                    pollStatus();
                } catch (error) {
                    console.warn("PDF indexing may have failed (non-critical):", error);
                }
            }

            // Create a new conversation with report context
            const response = await apiCall(API_ENDPOINTS.chatConversations, {
                method: "POST",
                body: JSON.stringify({
                    title: `Chat about ${report.title}`,
                    context_type: "report",
                    context_report_id: report.id,
                }),
            });

            if (response.ok) {
                const conversation = await response.json();
                setCurrentConversationId(conversation.id);
                setSelectedReport(report);
                setMessages([]);
                setShowReportDialog(false);
                await loadConversations();
            }
        } catch (error) {
            console.error("Failed to create conversation with report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenReportDialog = () => {
        setShowReportDialog(true);
        loadReports();
    };

    const loadConversation = async (conversationId: number) => {
        try {
            setIsLoading(true);
            const response = await apiCall(
                API_ENDPOINTS.chatConversation(conversationId)
            );

            if (response.ok) {
                const data = await response.json();
                setCurrentConversationId(conversationId);
                setMessages(
                    data.messages?.map(
                        (msg: {
                            id: number;
                            role: string;
                            content: string;
                            created_at?: string;
                        }) => ({
                            id: msg.id,
                            role: msg.role as "user" | "assistant",
                            content: msg.content,
                            created_at: msg.created_at,
                        })
                    ) || []
                );

                // Load selected context
                if (data.context_knowledge_base_id) {
                    // Load KB details
                    const kbResponse = await apiCall(API_ENDPOINTS.knowledgeBase(data.context_knowledge_base_id));
                    if (kbResponse.ok) {
                        const kbData = await kbResponse.json();
                        setSelectedKnowledgeBase(kbData);
                        setSelectedReport(null);
                    }
                } else if (data.context_report_id) {
                    await loadSelectedReport(data.context_report_id);
                    setSelectedKnowledgeBase(null);
                } else {
                    setSelectedReport(null);
                    setSelectedKnowledgeBase(null);
                }
            }
        } catch (error) {
            console.error("Failed to load conversation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        // If no conversation exists, create one first
        let conversationId = currentConversationId;
        if (!conversationId) {
            try {
                const response = await apiCall(API_ENDPOINTS.chatConversations, {
                    method: "POST",
                    body: JSON.stringify({
                        title: trimmed.substring(0, 50),
                        context_type: "general",
                    }),
                });

                if (response.ok) {
                    const conversation = await response.json();
                    conversationId = conversation.id;
                    setCurrentConversationId(conversationId);
                    await loadConversations();
                } else {
                    console.error("Failed to create conversation");
                    return;
                }
            } catch (error) {
                console.error("Failed to create conversation:", error);
                return;
            }
        }

        if (conversationId == null) {
            return;
        }

        // Add user message to UI immediately
        const userMessage: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: trimmed,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsSending(true);

        try {
            const response = await apiCall(
                API_ENDPOINTS.chatMessages(conversationId),
                {
                    method: "POST",
                    body: JSON.stringify({
                        content: trimmed,
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const aiMessage: ChatMessage = {
                    id: data.message.id,
                    role: "assistant",
                    content: data.message.content,
                    created_at: data.message.created_at,
                };
                setTypingMessageId(aiMessage.id); // Trigger typewriter effect
                setMessages((prev) => [...prev, aiMessage]);
                await loadConversations(); // Refresh to update last_message_at
            } else {
                const errorData = await response.json();
                console.error("Failed to send message:", errorData);
                // Remove the user message on error
                setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // Remove the user message on error
            setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const clearConversations = async () => {
        if (confirm("Are you sure you want to clear all conversations?")) {
            try {
                setIsClearingConversations(true);
                // Delete all conversations from backend
                const deletePromises = conversations.map((conv) =>
                    apiCall(API_ENDPOINTS.chatConversation(conv.id), {
                        method: "DELETE",
                    })
                );

                await Promise.all(deletePromises);

                // Clear local state
                setConversations([]);
                setMessages([]);
                setCurrentConversationId(null);
                setSelectedReport(null);
            } catch (error) {
                console.error("Failed to delete conversations:", error);
                // Still clear local state even if API calls fail
                setConversations([]);
                setMessages([]);
                setCurrentConversationId(null);
                setSelectedReport(null);
            } finally {
                setIsClearingConversations(false);
            }
        }
    };

    return {
        // State
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

        // Knowledge Base Exports
        knowledgeBases,
        selectedKnowledgeBase,
        isLoadingKnowledgeBases,

        // Actions
        loadConversations,
        resetToWelcome,
        loadReports,
        checkIndexingStatus,
        loadSelectedReport,
        handleSelectReport,
        handleOpenReportDialog,
        loadConversation,
        handleSend,
        clearConversations,
        setCurrentConversationId,
        setMessages,

        // Knowledge Base Actions
        loadKnowledgeBases,
        handleSelectKnowledgeBase,
        setKnowledgeBases, // Exposed for updates after CRUD
        setSelectedKnowledgeBase // Exposed for updates
    };
};
