// File: src/components/ui/dropdown/SearchableDropdown.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFormContext, Controller, FieldValues, Path } from "react-hook-form";

export interface DropdownOption<T = string | number | boolean> {
    label: string;
    value: T; // value ke form (boleh boolean)
    key: string | number; // khusus React key
}

interface SearchableDropdownProps<TForm extends FieldValues, TValue = string | number | boolean> {
    name: Path<TForm>;
    label?: string;
    placeholder?: string;
    options: DropdownOption<TValue>[];
    disabled?: boolean;
    isSearchable?: boolean;
    isClearable?: boolean;
    className?: string;
}

export function SearchableDropdown<TForm extends FieldValues, TValue = string | number | boolean>({
    name,
    label,
    placeholder = "Select an option...",
    options,
    disabled = false,
    isSearchable = true,
    isClearable = true,
    className = "",
}: SearchableDropdownProps<TForm, TValue>) {
    const { control } = useFormContext<TForm>();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            inputRef.current?.focus();
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }) => {
                const selectedOption = options.find((opt) => opt.value === field.value);

                return (
                    <div className={`w-full ${className}`}>
                        {label && <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>}

                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(!isOpen);
                                    setSearchQuery("");
                                }}
                                disabled={disabled}
                                className={`w-full h-12 px-3 border rounded-lg bg-white text-left text-sm flex items-center justify-between
                                    ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:border-gray-400"}
                                    ${error ? "border-red-500" : "border-geonet-soft-gray"}`}
                            >
                                <span className={`truncate ${selectedOption ? "text-gray-900" : "text-zinc-400"}`}>{selectedOption ? selectedOption.label : placeholder}</span>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50">
                                    {isSearchable && (
                                        <div className="p-3 border-b border-gray-200">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    )}

                                    <ul className="max-h-60 overflow-y-auto">
                                        {filteredOptions.length === 0 ? (
                                            <li className="px-4 py-3 text-sm text-gray-500 text-center">No options found</li>
                                        ) : (
                                            filteredOptions.map((option) => (
                                                <li key={option.key}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            field.onChange(option.value);
                                                            setIsOpen(false);
                                                            setSearchQuery("");
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm
                                                            ${field.value === option.value ? "bg-aksen-secondary/10 text-aksen-secondary font-medium" : "text-gray-700 hover:bg-gray-100"}`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                </li>
                                            ))
                                        )}
                                    </ul>

                                    {isClearable && field.value !== undefined && (
                                        <div className="border-t border-gray-200 p-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(undefined);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                    </div>
                );
            }}
        />
    );
}
