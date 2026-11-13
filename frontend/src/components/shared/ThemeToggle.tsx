"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeToggleProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  className?: string;
}

export default function ThemeToggle({
  darkMode: propDarkMode,
  onToggleDarkMode: propOnToggle,
  className = "",
}: ThemeToggleProps) {
  const { darkMode: contextDarkMode, toggleDarkMode } = useTheme();
  const isDark = propDarkMode !== undefined ? propDarkMode : contextDarkMode;

  const handleToggle = () => {
    if (propOnToggle) {
      propOnToggle();
      return;
    }
    toggleDarkMode();
  };

  const label = isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={handleToggle}
            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 glass-pill cursor-pointer ${className}`}
            aria-label={label}
          />
        }
      >
        <Sun className="hidden dark:block w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0" />
        <Moon
          className="block dark:hidden w-4 h-4 transition-transform duration-300"
          style={{ color: "var(--primary)" }}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
