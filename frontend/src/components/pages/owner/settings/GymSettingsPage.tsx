"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { tenantAPI } from "@/lib/api/tenantApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TENANT_HEADER_KEY } from "@/hooks/useTenantHeader";
import {
    IconUpload,
    IconPhoto,
    IconTrash,
    IconRefresh,
    IconBuildingStore,
    IconCheck,
    IconMail,
    IconUser,
    IconLink,
    IconPencil,
    IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import CustomButton from "@/components/ui/button/CustomButton";
import LandingSettingsForm from "./LandingSettingsForm";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TenantInfo {
    name: string;
    slug: string;
    owner_name: string;
    owner_email: string;
    logo_url: string | null;
    landing_page?: any;
    branches?: any[];
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 2;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function GymSettingsPage() {
    const queryClient = useQueryClient();
    const [tenant, setTenant] = useState<TenantInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Edit Gym Name States
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState("");
    const [savingName, setSavingName] = useState(false);

    // Active Tab State
    const [activeTab, setActiveTab] = useState<"gym" | "landing">("gym");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // ── Load current tenant data
    useEffect(() => {
        const load = async () => {
            try {
                const data = await tenantAPI.getCurrent();
                setTenant({
                    name: data.name,
                    slug: data.slug,
                    owner_name: data.owner_name,
                    owner_email: data.owner_email,
                    logo_url: data.logo_url ?? null,
                    landing_page: data.landing_page,
                    branches: data.branches,
                });
                setEditName(data.name);
            } catch {
                toast.error("Gagal memuat data gym");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── File validation
    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.`;
        }
        return null;
    };

    // ── Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }
        setSelectedFile(file);
        setUploadSuccess(false);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    // ── Drag & Drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    // ── Upload
    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const result = await tenantAPI.uploadLogo(selectedFile);
            setTenant((prev) => prev ? { ...prev, logo_url: result.logo_url } : prev);
            setSelectedFile(null);
            setPreview(null);
            setUploadSuccess(true);
            // Invalidate cache agar TenantHeader langsung update
            queryClient.invalidateQueries({ queryKey: TENANT_HEADER_KEY });
            toast.success("Logo berhasil disimpan!");
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Gagal upload logo. Coba lagi.";
            toast.error(msg);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ── Save Gym Name
    const handleSaveName = async () => {
        if (!editName.trim()) return;
        setSavingName(true);
        try {
            await tenantAPI.updateSettings({ name: editName.trim() });
            setTenant((prev) => prev ? { ...prev, name: editName.trim() } : prev);
            setIsEditingName(false);
            // Invalidate cache agar TenantHeader langsung update nama gym
            queryClient.invalidateQueries({ queryKey: TENANT_HEADER_KEY });
            toast.success("Nama gym berhasil diperbarui!");
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Gagal memperbarui nama gym. Coba lagi.";
            toast.error(msg);
        } finally {
            setSavingName(false);
        }
    };


    // ── Cancel preview
    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Current logo (preview > saved)
    const currentLogo = preview ?? tenant?.logo_url ?? null;

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-white rounded-xl border border-gray-500/20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-aksen-secondary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-zinc-500 font-figtree">Memuat data gym...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                {/* ── Breadcrumbs */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Pengaturan</li>
                        <li>
                            <Link className="text-aksen-secondary" href="/owner/settings">Pengaturan Gym</Link>
                        </li>
                    </ul>
                </div>

                {/* ── Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-zinc-800">Pengaturan Gym</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Kelola identitas visual gym Anda yang tampil di seluruh sistem.
                    </p>
                </div>

                <hr className="border-zinc-200 mb-6" />

                {/* ── Tabs Navigation */}
                <div className="flex border-b border-zinc-200 mb-6">
                    <button
                        onClick={() => setActiveTab("gym")}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all hover:cursor-pointer ${
                            activeTab === "gym"
                                ? "border-aksen-secondary text-aksen-secondary"
                                : "border-transparent text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                        Profil Gym & Logo
                    </button>
                    <button
                        onClick={() => setActiveTab("landing")}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all hover:cursor-pointer ${
                            activeTab === "landing"
                                ? "border-aksen-secondary text-aksen-secondary"
                                : "border-transparent text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                        Pengaturan Landing Page
                    </button>
                </div>

                {activeTab === "gym" && (
                    <>
                        <div className="grid grid-cols-12 gap-8">
                            {/* ── KIRI: Informasi Gym */}
                            <div className="col-span-12 md:col-span-4 space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-800">Informasi Gym</h2>
                                
                                <div className="bg-zinc-50 rounded-xl border border-zinc-200/60 p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3 border-b border-zinc-200/60 pb-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-aksen-secondary/10 flex items-center justify-center flex-shrink-0 text-aksen-secondary">
                                                <IconBuildingStore size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-zinc-400 font-medium">Nama Gym</p>
                                                {isEditingName ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full mt-1 px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:border-aksen-secondary"
                                                        disabled={savingName}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <p className="font-bold text-zinc-800 truncate text-sm">{tenant?.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        {!isEditingName ? (
                                            <button
                                                onClick={() => {
                                                    setEditName(tenant?.name ?? "");
                                                    setIsEditingName(true);
                                                }}
                                                className="text-zinc-400 hover:text-aksen-secondary transition-colors p-1.5 rounded-lg hover:bg-zinc-100 flex-shrink-0"
                                                title="Ubah Nama Gym"
                                            >
                                                <IconPencil size={16} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1 mt-3 flex-shrink-0">
                                                <button
                                                    onClick={handleSaveName}
                                                    disabled={savingName || !editName.trim()}
                                                    className="text-green-600 hover:text-green-700 transition-colors p-1 rounded hover:bg-green-50 disabled:opacity-50"
                                                    title="Simpan"
                                                >
                                                    <IconCheck size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingName(false)}
                                                    disabled={savingName}
                                                    className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                                    title="Batal"
                                                >
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-aksen-secondary/10 flex items-center justify-center flex-shrink-0 text-aksen-secondary">
                                            <IconMail size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-400 font-medium">Email Pemilik</p>
                                            <p className="font-semibold text-zinc-700 truncate text-sm">{tenant?.owner_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-aksen-secondary/10 flex items-center justify-center flex-shrink-0 text-aksen-secondary">
                                            <IconUser size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-400 font-medium">Nama Pemilik</p>
                                            <p className="font-semibold text-zinc-700 truncate text-sm">{tenant?.owner_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-aksen-secondary/10 flex items-center justify-center flex-shrink-0 text-aksen-secondary">
                                            <IconLink size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-400 font-medium">Domain Slug</p>
                                            <p className="font-mono text-xs text-zinc-600 truncate bg-zinc-200/50 px-1.5 py-0.5 rounded mt-0.5">{tenant?.slug}.gymfit.id</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── KANAN: Logo Gym (Upload Form) */}
                            <div className="col-span-12 md:col-span-8 space-y-4">
                                <h2 className="text-lg font-semibold text-zinc-800">Logo Gym</h2>
                                
                                <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
                                    {/* Preview Area & Upload Area */}
                                    <div className="flex flex-col sm:flex-row items-start gap-6">
                                        {/* Preview Container */}
                                        <div className="flex-shrink-0">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Preview Logo</p>
                                            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden relative shadow-sm">
                                                {currentLogo ? (
                                                    <>
                                                        <Image
                                                            src={currentLogo}
                                                            alt="Logo gym"
                                                            fill
                                                            className="object-contain p-2"
                                                            unoptimized={preview !== null}
                                                        />
                                                        {uploadSuccess && (
                                                            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center rounded-2xl">
                                                                <IconCheck className="text-white" size={32} />
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <IconPhoto className="text-zinc-300" size={36} />
                                                )}
                                            </div>
                                            {/* Display Size badges */}
                                            <div className="mt-3 space-y-1">
                                                <LogoSizeBadge label="Sidebar" size="40px" />
                                                <LogoSizeBadge label="Header" size="40px" />
                                            </div>
                                        </div>

                                        {/* Drag & Drop Upload Zone */}
                                        <div className="flex-1 w-full">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Upload Baru</p>
                                            <div
                                                ref={dropZoneRef}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`
                                                    relative border-2 border-dashed rounded-xl p-6 cursor-pointer
                                                    transition-all duration-200 text-center flex flex-col justify-center items-center h-28
                                                    ${isDragging
                                                        ? "border-aksen-secondary bg-aksen-secondary/5 scale-[1.01]"
                                                        : selectedFile
                                                        ? "border-green-400 bg-green-50/30"
                                                        : "border-zinc-200 bg-zinc-50/50 hover:border-aksen-secondary/50 hover:bg-aksen-secondary/5"
                                                    }
                                                `}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept={ACCEPTED_EXTENSIONS}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />

                                                {selectedFile ? (
                                                    <div className="space-y-1 w-full">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                                            <IconCheck className="text-green-600" size={16} />
                                                        </div>
                                                        <p className="text-xs font-semibold text-green-800 truncate px-4">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400">
                                                            {(selectedFile.size / 1024).toFixed(0)} KB — klik untuk ganti
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                                                            <IconUpload size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-zinc-700">
                                                                Drag & drop atau <span className="text-aksen-secondary underline">pilih file</span>
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 mt-0.5">JPG, PNG, WebP · Maks. 2MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Buttons */}
                                    {selectedFile && (
                                        <div className="flex gap-3 pt-2">
                                            <CustomButton
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="flex-1 text-white py-2 px-4 h-10"
                                            >
                                                {uploading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Mengupload...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <IconUpload size={16} />
                                                        <span>Simpan Logo</span>
                                                    </div>
                                                )}
                                            </CustomButton>
                                            <button
                                                onClick={handleCancel}
                                                disabled={uploading}
                                                className="flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 text-zinc-600 rounded-xl font-medium text-sm transition-all hover:bg-zinc-50 disabled:opacity-50 hover:cursor-pointer h-10"
                                            >
                                                <IconTrash size={16} />
                                                Batal
                                            </button>
                                        </div>
                                    )}

                                    {/* Active Logo Indicator */}
                                    {!selectedFile && tenant?.logo_url && (
                                        <div className="flex items-center gap-2.5 p-3.5 bg-green-50/50 rounded-xl border border-green-100">
                                            <IconCheck className="text-green-500 flex-shrink-0" size={16} />
                                            <p className="text-sm text-green-800 flex-1 truncate">
                                                Logo aktif saat ini sedang digunakan di seluruh sistem.
                                            </p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-1 text-xs text-aksen-secondary font-semibold hover:underline flex-shrink-0 hover:cursor-pointer"
                                            >
                                                <IconRefresh size={14} />
                                                Ganti Logo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Tips & Guidelines */}
                        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-aksen-secondary text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">!</div>
                            <div className="text-sm text-blue-900 space-y-1">
                                <p className="font-semibold">Panduan logo terbaik:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-blue-700 text-xs">
                                    <li>Gunakan gambar persegi (1:1) untuk hasil display yang paling optimal.</li>
                                    <li>PNG transparan sangat disarankan agar menyatu dengan warna background header.</li>
                                    <li>Gunakan resolusi minimal 200 × 200 piksel.</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "landing" && (
                    <LandingSettingsForm 
                        initialConfig={tenant?.landing_page} 
                        branches={tenant?.branches || []} 
                    />
                )}
            </div>
        </div>
    );
}

// ── Helper: Logo size badge
function LogoSizeBadge({ label, size }: { label: string; size: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">{label}:</span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1 rounded">{size}</span>
        </div>
    );
}

