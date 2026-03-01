"use client";

import { Icon } from "@/components/icon";
import React, { useState } from "react";

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    className?: string;
    width?: string;
    render?: (row: T) => React.ReactNode;
}

export interface ActionItem<T> {
    label: string;
    icon?: React.ComponentProps<typeof Icon>["name"];
    onClick: (row: T) => void;
    className?: string;
    divider?: boolean; // untuk menambahkan garis pembatas
}

interface CustomTableProps<T> {
    columns: Column<T>[];
    data: T[];
    withCheckbox?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onRowClick?: (row: T) => void;
    tableClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    // Props baru untuk custom actions
    actions?: ActionItem<T>[];
    showDefaultActions?: boolean; // untuk menampilkan edit/delete lama atau tidak
}

export default function CustomTable<T>({ columns, data, withCheckbox = false, onEdit, onDelete, onRowClick, tableClassName = "", headerClassName = "", bodyClassName = "", actions = [], showDefaultActions = false }: CustomTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const toggleSelect = (index: number) => {
        setSelectedRows((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const allSelected = data.length > 0 && selectedRows.length === data.length;

    const toggleSelectAll = () => {
        setSelectedRows(allSelected ? [] : data.map((_, i) => i));
    };

    // Gabungkan default actions dengan custom actions
    const defaultActions: ActionItem<T>[] = [];
    if (showDefaultActions && onEdit) {
        defaultActions.push({
            label: "Edit",
            icon: "plus",
            onClick: onEdit,
            className: "hover:bg-zinc-100",
        });
    }
    if (showDefaultActions && onDelete) {
        defaultActions.push({
            label: "Delete",
            icon: "trash",
            onClick: onDelete,
            className: "hover:bg-red-50 text-red-600",
        });
    }

    const allActions = [...defaultActions, ...actions];
    const hasActions = allActions.length > 0;

    return (
        <div className="overflow-x-auto overflow-y-visible relative">
            <table className={`min-w-full ${tableClassName}`}>
                {/* HEAD */}
                <thead className={`text-zinc-400 ${headerClassName}`}>
                    <tr>
                        {withCheckbox && (
                            <th className="w-14 px-3 py-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="checkbox checkbox-sm border-zinc-400 checked:bg-zinc-600 checked:text-white" />
                            </th>
                        )}

                        {columns.map((col, i) => (
                            <th key={i} className={`px-3 py-3 text-start text-xs font-medium ${col.className ?? ""} ${col.width ?? ""}`}>
                                {col.header}
                            </th>
                        ))}

                        {hasActions && <th className="w-20 px-3 py-3 text-center text-xs font-medium">Action</th>}
                    </tr>
                </thead>

                {/* BODY */}
                <tbody className={bodyClassName}>
                    {data.length > 0 ? (
                        data.map((row, i) => (
                            <tr
                                key={i}
                                onClick={(e) => {
                                    const target = e.target as HTMLElement;

                                    if (target.closest("button") || target.closest("input[type='checkbox']") || target.closest(".dropdown")) {
                                        return;
                                    }

                                    onRowClick?.(row);
                                }}
                                className={`border-t border-zinc-200 transition-colors hover:bg-zinc-50 ${onRowClick ? "cursor-pointer" : ""}`}
                            >
                                {withCheckbox && (
                                    <td className="w-14 px-3 py-3 text-center">
                                        <input type="checkbox" checked={selectedRows.includes(i)} onChange={() => toggleSelect(i)} className="checkbox checkbox-sm border-aksen-secondary checked:bg-aksen-secondary checked:text-white" />
                                    </td>
                                )}

                                {columns.map((col, j) => (
                                    <td key={j} className={`px-3 py-3 text-sm font-medium text-aksen-secondary ${col.className ?? ""}`}>
                                        {col.render ? col.render(row) : null}
                                    </td>
                                ))}

                                {hasActions && (
                                    <td className="px-3 py-3 text-center">
                                        <div className="dropdown dropdown-end">
                                            <button tabIndex={0} className="btn btn-ghost btn-sm rounded-lg text-center hover:bg-zinc-100" onClick={(e) => e.stopPropagation()}>
                                                <Icon name="dotsVertical" className="h-5 w-5 text-zinc-600" />
                                            </button>
                                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-white rounded-lg w-52 border border-zinc-200  z-50">
                                                {allActions.map((action, idx) => (
                                                    <React.Fragment key={idx}>
                                                        {action.divider && idx > 0 && <hr className="border-zinc-200 my-1" />}
                                                        <li>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    action.onClick(row);
                                                                    // Close dropdown
                                                                    const elem = document.activeElement as HTMLElement;
                                                                    elem?.blur();
                                                                }}
                                                                className={`flex items-center gap-2 px-3 py-2 text-sm ${action.className ?? ""}`}
                                                            >
                                                                {action.icon && <Icon name={action.icon} className="h-4 w-4" />}
                                                                <span>{action.label}</span>
                                                            </button>
                                                        </li>
                                                    </React.Fragment>
                                                ))}
                                            </ul>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (withCheckbox ? 1 : 0) + (hasActions ? 1 : 0)} className="py-5 text-center text-sm text-aksen-secondary">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
