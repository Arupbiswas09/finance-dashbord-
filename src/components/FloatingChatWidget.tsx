import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FloatingChatButton } from "./FloatingChatButton";
import { FloatingChatModal } from "./FloatingChatModal";

export const FloatingChatWidget = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const location = useLocation();

    // Routes where the floating chat should NOT appear
    const excludedRoutes = [
        "/",
        "/login",
        "/register",
        "/verify-email",
        "/forgot-password",
        "/confirm-password",
        "/settings",
        "/accounting-ai",
        "/unauthorized",
    ];

    // Check if current route is excluded
    const isExcluded = excludedRoutes.some((route) => {
        if (route === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(route);
    });

    // Also exclude shared report routes
    const isSharedReport = location.pathname.startsWith("/shared-report/");

    if (isExcluded || isSharedReport) {
        return null;
    }

    return (
        <>
            <FloatingChatButton onClick={() => setIsModalOpen(true)} />
            <FloatingChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                conversationId={conversationId}
            />
        </>
    );
};
