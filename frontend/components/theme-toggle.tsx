"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "dropdown" | "icon-only";
  className?: string;
}

export function ThemeToggle({
  variant = "dropdown",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = resolvedTheme === "dark";

  if (variant === "icon-only") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={
          isDark
            ? language === "th"
              ? "เปลี่ยนเป็น Light mode"
              : "Switch to Light mode"
            : language === "th"
              ? "เปลี่ยนเป็น Dark mode"
              : "Switch to Dark mode"
        }
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(theme === "light" && "bg-primary/10 text-primary")}
        >
          <Sun className="mr-2 h-4 w-4" />
          {language === "th" ? "สว่าง" : "Light"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" && "bg-primary/10 text-primary")}
        >
          <Moon className="mr-2 h-4 w-4" />
          {language === "th" ? "มืด" : "Dark"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(theme === "system" && "bg-primary/10 text-primary")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {language === "th" ? "ตามระบบ" : "System"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
