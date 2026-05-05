"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useInfiniteDictionaries } from "@/hooks/useDictionaries";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface DictionarySelectProps {
    type: string;
    parentId?: number;
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
}

export function DictionarySelect({
    type,
    parentId,
    value,
    onChange,
    placeholder = "Выберите...",
    label,
    disabled = false,
    required = false,
}: DictionarySelectProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic parentId handling: if parentId is provided but is NaN or 0 (when it should be something), 
    // we might want to disable the select or handle it.
    // However, the component should just follow the 'disabled' prop and parentId.

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const isModelWithoutParent = type === "MODEL" && !parentId;
    const isEffectivelyDisabled = disabled || isModelWithoutParent;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteDictionaries(type, parentId, debouncedSearch);

    // Filter items locally if needed, but primarily handle empty parent
    const items = useMemo(() => {
        if (isModelWithoutParent) return [];
        return data?.pages.flatMap((page) => page) || [];
    }, [data, isModelWithoutParent]);

    const selectedItem = useMemo(() => {
        if (!value) return null;
        // Try to find in current pages, or hope the name is cached elsewhere (TBD)
        return items.find((item) => item.id.toString() === value);
    }, [value, items]);

    return (
        <div className={cn("w-full transition-all duration-300", isEffectivelyDisabled && "opacity-60")}>
            {label && (
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <DropdownMenu open={open && !isEffectivelyDisabled} onOpenChange={(o) => !isEffectivelyDisabled && setOpen(o)}>
                <DropdownMenuTrigger asChild>
                    <button
                        disabled={isEffectivelyDisabled}
                        type="button"
                        className={cn(
                            "flex items-center justify-between w-full px-4 h-11 sm:h-12 rounded-xl text-sm font-semibold transition-all outline-none border",
                            open && !isEffectivelyDisabled
                                ? "bg-white border-slate-400 ring-2 ring-slate-100 shadow-sm"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50",
                            isEffectivelyDisabled && "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                        )}
                    >
                        <span className={cn("truncate", !selectedItem && "text-slate-400 font-medium")}>
                            {selectedItem ? selectedItem.name : (placeholder === "Выберите..." ? t("dictionary.select") : placeholder)}
                        </span>
                        <div className="flex items-center gap-2">
                            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                            <ChevronDown className={cn("h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300", open && "rotate-180")} />
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-72 p-0 rounded-2xl shadow-2xl border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <InfiniteScrollContent
                        search={search}
                        setSearch={setSearch}
                        items={items}
                        value={value}
                        onChange={onChange}
                        setOpen={setOpen}
                        isLoading={isLoading}
                        isError={isError}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        type={type}
                        containerRef={containerRef}
                        scrollEndRef={scrollEndRef}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function InfiniteScrollContent({
    search, setSearch, items, value, onChange, setOpen, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, type, containerRef, scrollEndRef
}: any) {
    const { t } = useTranslation();

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const container = containerRef.current;
        const sentinel = scrollEndRef.current;
        if (!container || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    console.log(`[DictionarySelect:${type}] Triggering next page...`);
                    fetchNextPage();
                }
            },
            {
                root: container,
                threshold: 0,
                rootMargin: '150px' // Increased margin for smoother loading
            }
        );
        observer.observe(sentinel);

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight - scrollTop - clientHeight < 80) { // Larger threshold for scroll fallback
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }
        };
        container.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            container.removeEventListener('scroll', handleScroll);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, type]);

    return (
        <>
            <div className="p-3 bg-white border-b border-slate-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={t("dictionary.search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-sm font-medium focus-visible:ring-2 focus-visible:ring-slate-100 placeholder:text-slate-400"
                        autoFocus
                    />
                </div>
            </div>

            <div
                ref={containerRef}
                className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
            >
                <div className="p-1.5 space-y-0.5">
                    <button
                        type="button"
                        onClick={() => {
                            onChange(null);
                            setOpen(false);
                        }}
                        className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors decoration-none",
                            !value ? "bg-slate-50 text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <span>{t("dictionary.any")}</span>
                        {!value && <Check className="h-4 w-4 text-slate-900" />}
                    </button>

                    {items.map((item: any) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                onChange(item.id.toString());
                                setOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-all",
                                value === item.id.toString()
                                    ? "bg-slate-50 text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <span className="truncate">{item.name}</span>
                            {value === item.id.toString() && <Check className="h-4 w-4 text-slate-900" />}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="py-10 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t("dictionary.loading")}</span>
                    </div>
                )}

                {isError && (
                    <div className="py-10 flex flex-col items-center justify-center gap-2 text-red-400 px-4 text-center">
                        <Search className="h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t("dictionary.error")}</span>
                    </div>
                )}

                {!isLoading && !isError && items.length === 0 && (
                    <div className="py-12 text-center px-4">
                        <Search className="h-8 w-8 text-slate-100 mx-auto mb-3" />
                        <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            {t("dictionary.not_found")}
                        </div>
                    </div>
                )}

                {hasNextPage && (
                    <div ref={scrollEndRef} className="py-4 flex justify-center border-t border-slate-50 mt-2 bg-slate-50/20">
                        {isFetchingNextPage ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("dictionary.loading")}</span>
                            </div>
                        ) : (
                            <div className="h-2 w-full" />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}


