"use client";

import React, { useState } from "react";
import {
    Controller,
    FieldValues,
    Path,
    useFormContext,
    RegisterOptions,
} from "react-hook-form";

const disabledInputStyle = "bg-geonet-primary-bg border-geonet-soft-gray/40 text-geonet-gray cursor-not-allowed placeholder:text-geonet-gray/90";
const disabledLabelStyle = "text-geonet-gray/50";

// helper ambil error nested
const getError = (errors: any, name: string) => {
    return name.split(".").reduce((acc, part) => acc?.[part], errors);
};

// ============================================
// Text Input
// ============================================
interface TextInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    position?: "left" | "right";
    disabled?: boolean;
    type?: string;
    rules?: RegisterOptions<T, Path<T>>
}

export const TextInput = <T extends FieldValues>(props: TextInputProps<T>) => {
    const form = useFormContext<T>();
    const [showPassword, setShowPassword] = useState(false);
    const error = getError(form.formState.errors, props.name);

    const isPasswordField = props.type === "password";
    const inputType = isPasswordField ? (showPassword ? "text" : "password") : props.type || "text";

    return (
        <Controller
            name={props.name}
            control={form.control}
            rules={props.rules}
            render={({ field }) => (
                <div className="space-y-2">
                    {props?.label ? <p className={`block text-sm font-medium ${props.disabled ? disabledLabelStyle : "text-geonet-black"}`}>{props?.label}</p> : null}
                    <div className="relative">
                        {props.icon && props.position === "left" && <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{props.icon}</div>}
                        <input
                            {...field}
                            type={inputType}
                            placeholder={props.placeholder}
                            disabled={props.disabled}
                            className={`input h-12 w-full rounded-lg border ${props.icon || isPasswordField ? (props.position === "left" ? "pr-3 pl-10" : "pr-10 pl-3") : "px-3"} ${props.disabled ? disabledInputStyle : "text-geonet-black"}
                            ${field.value ? "bg-transparent" : "bg-transparent"} `}
                        />
                        {isPasswordField && !props.disabled && (
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        )}
                        {props.icon && props.position === "right" && !isPasswordField && <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">{props.icon}</div>}
                    </div>
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                </div>
            )}
        />
    );
};

// ============================================
// Toggle
// ============================================
interface ToggleInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    disabled?: boolean;
    rules?: RegisterOptions<T, Path<T>>
}

export const ToggleInput = <T extends FieldValues>(props: ToggleInputProps<T>) => {
    const form = useFormContext<T>();
    const error = getError(form.formState.errors, props.name);

    return (
        <>
            <Controller
                name={props.name}
                control={form.control}
                rules={props.rules}
                render={({ field }) => (
                    <label className={`flex items-center space-x-2 ${props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                        <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={props.disabled}
                            className="toggle toggle-sm border-geonet-blue checked:bg-geonet-blue mr-2 rounded-xl checked:text-white"
                        />
                        {props.label ? <span className="text-xs font-semibold">{props.label}</span> : null}
                    </label>
                )}
            />
            {error && <p className="text-xs text-red-500">{error.message}</p>}
        </>
    );
};

// ============================================
// TextArea
// ============================================
interface TextAreaInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    rules?: RegisterOptions<T, Path<T>>
}

export const TextAreaInput = <T extends FieldValues>(props: TextAreaInputProps<T>) => {
    const form = useFormContext<T>();
    const error = getError(form.formState.errors, props.name);

    return (
        <Controller
            name={props.name}
            control={form.control}
            rules={props.rules}
            render={({ field }) => (
                <div className="w-full space-y-2">
                    {props?.label ? <p className={`text-sm font-semibold ${props.disabled ? disabledLabelStyle : "text-geonet-black"}`}>{props?.label}</p> : null}
                    <textarea {...field} placeholder={props.placeholder} disabled={props.disabled} className={`input h-24 w-full resize-y rounded-lg pt-2 ${props.disabled ? disabledInputStyle : ""}`} />
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                </div>
            )}
        />
    );
};

// ============================================
// Number Input
// ============================================
interface NumberInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    rules?: RegisterOptions<T, Path<T>>
}

export const NumberInput = <T extends FieldValues>(props: NumberInputProps<T>) => {
    const form = useFormContext<T>();
    const error = getError(form.formState.errors, props.name);

    return (
        <Controller
            name={props.name}
            control={form.control}
            rules={props.rules}
            render={({ field }) => (
                <div className="w-full space-y-2">
                    {props?.label ? <p className={`text-sm font-semibold ${props.disabled ? disabledLabelStyle : "text-geonet-black"}`}>{props?.label}</p> : null}
                    <input {...field} type="number" placeholder={props.placeholder} disabled={props.disabled} className={`input rounded-lg h-12 w-full ${props.disabled ? disabledInputStyle : "text-geonet-black"}`} />
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                </div>
            )}
        />
    );
};

// ============================================
// DatePicker
// ============================================
interface DatePickerInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    disabled?: boolean;
    rules?: RegisterOptions<T, Path<T>>
}

export const DatePickerInput = <T extends FieldValues>(props: DatePickerInputProps<T>) => {
    const form = useFormContext<T>();
    const error = getError(form.formState.errors, props.name);

    return (
        <Controller
            name={props.name}
            control={form.control}
            rules={props.rules}
            render={({ field }) => (
                <div className="w-full space-y-2">
                    {props?.label ? <p className="text-sm font-semibold">{props?.label}</p> : null}
                    <input {...field} type="date" disabled={props.disabled} className={`input h-12 w-full rounded-lg ${props.disabled ? "cursor-not-allowed bg-gray-50 opacity-50" : ""}`} />
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                </div>
            )}
        />
    );
};

// ============================================
// Search Input
// ============================================
interface SearchInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    rules?: RegisterOptions<T, Path<T>>
}

export const SearchInput = <T extends FieldValues>(props: SearchInputProps<T>) => {
    const form = useFormContext<T>();
    const error = getError(form.formState.errors, props.name);

    return (
        <Controller
            name={props.name}
            control={form.control}
            rules={props.rules}
            render={({ field }) => (
                <div className="w-full space-y-2">
                    {props?.label ? <p className={`block text-sm font-medium ${props.disabled ? "text-geonet-gray/50" : "text-geonet-black"}`}>{props?.label}</p> : null}
                    <div className="relative w-full">
                        <div className="absolute z-10 flex h-full w-10 items-center justify-center">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                        </div>
                        <input {...field} type="search" placeholder={props.placeholder || "Search"} disabled={props.disabled} className="input h-10 w-full pl-10 rounded-lg" />
                    </div>
                    {error && <p className="text-xs text-red-500">{error.message}</p>}
                </div>
            )}
        />
    );
};

// ============================================
// Rating Input
// ============================================
interface RatingInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    disabled?: boolean;
    max?: number;
    rules?: RegisterOptions<T, Path<T>>
}

export const RatingInput = <T extends FieldValues>({ name, label, disabled = false, max = 5, rules }: RatingInputProps<T>) => {
    const { control, formState } = useFormContext<T>();
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const error = getError(formState.errors, name);

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => {
                const currentValue = field.value ?? 0;

                return (
                    <div className="space-y-2">
                        {label && <p className={`block text-sm font-medium ${disabled ? "text-geonet-gray/50" : "text-geonet-black"}`}>{label}</p>}
                        <div className="flex gap-2">
                            {Array.from({ length: max }).map((_, index) => {
                                const starValue = index + 1;
                                const isActive = hoveredStar !== null ? starValue <= hoveredStar : starValue <= currentValue;

                                return (
                                    <button
                                        key={starValue}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => field.onChange(starValue)}
                                        onMouseEnter={() => !disabled && setHoveredStar(starValue)}
                                        onMouseLeave={() => !disabled && setHoveredStar(null)}
                                        className={`transition-all duration-200 ease-in-out ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 40 38"
                                            fill={disabled ? (isActive ? "#000000" : "#B8B8B8") : isActive ? "#E8A600" : "#B8B8B8"}
                                            stroke={disabled ? (isActive ? "#000000" : "#B8B8B8") : isActive ? "#E8A600" : "#B8B8B8"}
                                            className="h-10 w-10 transition-all duration-200"
                                        >
                                            <path d="M7.65 38L10.9 23.95L0 14.5L14.4 13.25L20 0L25.6 13.25L40 14.5L29.1 23.95L32.35 38L20 30.55L7.65 38Z" />
                                        </svg>
                                    </button>
                                );
                            })}
                        </div>
                        {error && <p className="text-xs text-red-500">{error.message}</p>}
                    </div>
                );
            }}
        />
    );
};