import { AIIcon } from "@/components/icons/CustomIcons";
import { Button } from "@/components/ui/button";
import { useOrganizationColors } from "@/hooks/useOrganizationColors";

interface FloatingChatButtonProps {
    onClick: () => void;
}

export const FloatingChatButton = ({ onClick }: FloatingChatButtonProps) => {
    return (
        <Button
            onClick={onClick}
            className="fixed bottom-8 right-8 h-14 px-6 rounded-full bg-white/90 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(101,163,13,0.15)] text-slate-800 hover:text-[#65A30D] transition-all duration-300 hover:-translate-y-1 z-50 group flex items-center justify-center gap-3 w-auto"
        >
            <AIIcon className="h-6 w-6 text-[#65A30D] group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[14px]">Ask AI</span>
        </Button>
    );
};
