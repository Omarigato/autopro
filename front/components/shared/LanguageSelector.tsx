"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/lib/store";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
    const { lang, setLang } = useAppState();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "gap-2 text-muted-foreground hover:text-foreground rounded-xl border border-transparent hover:border-slate-200",
                        className
                    )}
                >
                    <Languages className="h-4 w-4" />
                    <span className="uppercase font-medium text-xs sm:text-sm">{lang}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                <DropdownMenuItem onClick={() => setLang("kk")} className="cursor-pointer font-medium">Қазақша</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("ru")} className="cursor-pointer font-medium">Русский</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer font-medium">English</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
