// File: src/components/pos/FilterDropdown.tsx
"use client";

import { ChevronDown } from "lucide-react";

interface FilterDropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 text-zinc-800 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aksen-primary appearance-none cursor-pointer"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute text-zinc-500 right-3 top-2.5">
                <ChevronDown />
            </div>
        </div>
    );
};
