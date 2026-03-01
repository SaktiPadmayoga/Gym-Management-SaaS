"use client";

import { Icon } from "@/components/icon";
import { useRouter, useSearchParams } from "next/navigation";

interface RowsPerPageSelectProps {
    options?: number[];
    defaultValue?: number;
    onChange?: (value: number) => void;
}

export default function RowsPerPageSelect({ options = [5, 10, 20, 50], defaultValue = 10, onChange }: RowsPerPageSelectProps) {
    const router = useRouter();
    const params = useSearchParams();

    const perPage = Number(params.get("per_page")) || defaultValue;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPerPage = Number(e.target.value);
        const newParams = new URLSearchParams(params.toString());
        newParams.set("per_page", newPerPage.toString());
        newParams.set("page", "1");
        router.push(`?${newParams.toString()}`);

        if (onChange) onChange(newPerPage);
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="relative inline-block">
                <select id="rows" value={perPage} onChange={handleChange} className="border-zinc-200 text-zinc-500 appearance-none rounded-md border bg-white px-3 py-2.5 pr-8 text-sm focus:outline-none">
                    {options.map((n) => (
                        <option key={n} value={n}>
                            Show {n} rows
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute top-6.5 right-1 -translate-y-1/2">
                    <Icon name="arrowDown" className="h-6 w-6 text-zinc-500" />
                </div>
            </div>
        </div>
    );
}
