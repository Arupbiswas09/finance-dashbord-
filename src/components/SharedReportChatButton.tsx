import { AIIcon } from "@/components/icons/CustomIcons";
import { Button } from "@/components/ui/button";

interface SharedReportChatButtonProps {
    onClick: () => void;
}

export const SharedReportChatButton = ({ onClick }: SharedReportChatButtonProps) => {
    return (
        <Button
            onClick={onClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40"
            style={{
                backgroundColor: "#0c062c",
            }}
            size="icon"
        >
            <AIIcon className="h-6 w-6 text-white" />
        </Button>
    );
};
