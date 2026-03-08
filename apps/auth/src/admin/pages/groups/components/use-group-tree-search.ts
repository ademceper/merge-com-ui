import { useEffect, useRef, useState } from "react";

export type UseGroupTreeSearchReturn = {
    search: string;
    setSearch: (value: string) => void;
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
};

export function useGroupTreeSearch(): UseGroupTreeSearchReturn {
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(searchInput.trim());
            debounceRef.current = null;
        }, 250);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchInput]);

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
        inputRef.current?.focus();
    };

    return {
        search,
        setSearch,
        searchInput,
        setSearchInput,
        clearSearch,
        inputRef
    };
}
