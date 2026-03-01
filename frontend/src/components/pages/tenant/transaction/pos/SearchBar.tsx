// File: src/components/pos/SearchBar.tsx
"use client";

import { Icon } from "@/components/icon";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search products by name" }) => {
    return (
        <div className="relative">
            <Icon name="search" className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-zinc-800 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aksen-primary"
            />
        </div>
    );
};
