import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Eye, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoleBadgeProps {
  role: string;
  showIcon?: boolean;
  className?: string;
}

export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const { t } = useTranslation();
  const getRoleDetails = () => {
    switch (role.toLowerCase()) {
      case "owner":
        return {
          icon: <Shield className="h-3 w-3" />,
          variant: "default" as const,
          label: "Owner",
        };
      case "manager":
        return {
          icon: <ShieldCheck className="h-3 w-3" />,
          variant: "secondary" as const,
          label: "Manager",
        };
      case "viewer":
        return {
          icon: <Eye className="h-3 w-3" />,
          variant: "outline" as const,
          label: "Viewer",
        };
      default:
        return {
          icon: <User className="h-3 w-3" />,
          variant: "outline" as const,
          label: role,
        };
    }
  };

  const { icon, variant, label } = getRoleDetails();

  return (
    <Badge variant={variant} className={className}>
      {showIcon && <span className="mr-1">{icon}</span>}
      {t(label)}
    </Badge>
  );
}