import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageChangeDropdownProps {
  className?: string;
}

// Language options based on i18n.js configuration
const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
];

export const LanguageChangeDropdown: React.FC<LanguageChangeDropdownProps> = ({
  className = "",
}) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = localStorage.getItem("i18nextLng") || "en";
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [i18n]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("i18nextLng", langCode);
  };

  const currentLanguage = languageOptions.find(lang => lang.code === i18n.language) || languageOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={`flex items-center gap-2 h-8 px-3 rounded-full bg-[#f5f7fa] border-none  ${className}`}
          style={{ 
            backgroundColor: '#f5f7fa',
            borderColor: '#E5E7EB',
            color: '#111827'
          }}
        >
          <Languages className="w-4 h-4" style={{ color: '#3D52A0' }} />
          <span className="text-sm font-bold" style={{ color: '#111827' }}>{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" style={{ backgroundColor: '#FFFFFF' }}>
        {languageOptions.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50"
            style={{ backgroundColor: 'transparent' }}
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span style={{ color: '#111827' }}>{language.name}</span>
            </div>
            {i18n.language === language.code && (
              <Check className="w-4 h-4" style={{ color: '#16A34A' }} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Export the old name for backward compatibility
export const LanguageToggleButton = LanguageChangeDropdown;