"use client";
import React, { useState, useRef } from "react";
import { tenantAPI } from "@/lib/api/tenantApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TENANT_HEADER_KEY } from "@/hooks/useTenantHeader";
import CustomButton from "@/components/ui/button/CustomButton";
import { IconUpload, IconTrash, IconPlus } from "@tabler/icons-react";
import Image from "next/image";

interface LandingSettingsFormProps {
    initialConfig: any;
    branches: any[];
}

export default function LandingSettingsForm({ initialConfig, branches }: LandingSettingsFormProps) {
    const queryClient = useQueryClient();
    const [config, setConfig] = useState(() => {
        const base = {
            hero_title: "Train. Harder. Transform.",
            hero_subtitle: "Fasilitas kebugaran yang dirancang khusus untuk mendukung gaya hidup sehat Anda dengan instruktur profesional.",
            hero_cta_text: "Gabung Member",
            hero_image_url: "",
            show_about: true,
            about_description: "Kami percaya bahwa kesehatan adalah investasi terbaik. Dengan fasilitas modern dan instruktur berpengalaman, kami siap mendampingi perjalanan transformasi Anda mencapai versi terbaik diri Anda.",
            about_image_url_1: "",
            about_image_url_2: "",
            show_classes: true,
            programs: [],
            show_locations: true,
            branch_info: [],
            show_pricing: true,
            show_faq: true,
            faqs: [],
            testimonials: [],
            footer: {
                description: "",
                instagram: "",
                facebook: "",
                twitter: "",
                whatsapp: ""
            }
        };
        
        // Merge initial config
        if (initialConfig) {
            return { ...base, ...initialConfig, footer: { ...base.footer, ...(initialConfig.footer || {}) } };
        }
        return base;
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await tenantAPI.updateLandingPageSettings(config);
            queryClient.invalidateQueries({ queryKey: TENANT_HEADER_KEY });
            toast.success("Konfigurasi landing page berhasil disimpan!");
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Gagal memperbarui konfigurasi landing page.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (key: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-12 gap-8">
                {/* ── KIRI: VISIBILITAS ── */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-800">Visibilitas Section</h2>
                    <div className="bg-zinc-50 rounded-xl border border-zinc-200/60 p-5 space-y-3.5">
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-2">Tampilkan di Landing Page</p>
                        
                        <Toggle 
                            label="Section Tentang Kami" 
                            checked={config.show_about} 
                            onChange={(v) => updateConfig("show_about", v)} 
                        />
                        <Toggle 
                            label="Section Program Kelas" 
                            checked={config.show_classes} 
                            onChange={(v) => updateConfig("show_classes", v)} 
                        />
                        <Toggle 
                            label="Section Lokasi Cabang" 
                            checked={config.show_locations} 
                            onChange={(v) => updateConfig("show_locations", v)} 
                        />
                        <Toggle 
                            label="Section Paket Member" 
                            checked={config.show_pricing} 
                            onChange={(v) => updateConfig("show_pricing", v)} 
                        />
                        <Toggle 
                            label="Section FAQ" 
                            checked={config.show_faq} 
                            onChange={(v) => updateConfig("show_faq", v)} 
                        />
                    </div>
                </div>

                {/* ── KANAN: KONTEN ── */}
                <div className="col-span-12 md:col-span-8 space-y-6">
                    {/* Hero Section */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                        <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">Bagian Hero (Banner Utama)</h3>
                        <div className="space-y-4">
                            <TextInput 
                                label="Hero Title (Headline)" 
                                value={config.hero_title} 
                                onChange={(v) => updateConfig("hero_title", v)} 
                                required 
                            />
                            <TextArea 
                                label="Hero Subtitle" 
                                value={config.hero_subtitle} 
                                onChange={(v) => updateConfig("hero_subtitle", v)} 
                                required 
                            />
                            <TextInput 
                                label="Teks Tombol CTA" 
                                value={config.hero_cta_text} 
                                onChange={(v) => updateConfig("hero_cta_text", v)} 
                                required 
                            />
                            <ImageUploader 
                                label="Hero Background Image" 
                                value={config.hero_image_url} 
                                onChange={(v) => updateConfig("hero_image_url", v)} 
                            />
                        </div>
                    </div>

                    {/* About Section */}
                    {config.show_about && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                            <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">Bagian Tentang Kami</h3>
                            <TextArea 
                                label="Deskripsi Tentang Kami" 
                                value={config.about_description} 
                                onChange={(v) => updateConfig("about_description", v)} 
                                required 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUploader 
                                    label="Gambar Tentang Kami 1" 
                                    value={config.about_image_url_1} 
                                    onChange={(v) => updateConfig("about_image_url_1", v)} 
                                />
                                <ImageUploader 
                                    label="Gambar Tentang Kami 2" 
                                    value={config.about_image_url_2} 
                                    onChange={(v) => updateConfig("about_image_url_2", v)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Programs Section */}
                    {config.show_classes && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                <h3 className="text-base font-bold text-zinc-800">Program / Kelas</h3>
                                <button type="button" onClick={() => updateConfig("programs", [...(config.programs || []), { title: "", description: "", image_url: "" }])} className="text-xs text-aksen-secondary font-semibold hover:underline flex items-center gap-1">
                                    <IconPlus size={14} /> Tambah Program
                                </button>
                            </div>
                            {(config.programs || []).map((prog: any, idx: number) => (
                                <div key={idx} className="p-4 border border-zinc-100 rounded-lg space-y-3 bg-zinc-50 relative">
                                    <button type="button" onClick={() => {
                                        const newProgs = [...config.programs];
                                        newProgs.splice(idx, 1);
                                        updateConfig("programs", newProgs);
                                    }} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                        <IconTrash size={16} />
                                    </button>
                                    <TextInput label={`Nama Program ${idx + 1}`} value={prog.title} onChange={(v) => {
                                        const newProgs = [...config.programs];
                                        newProgs[idx].title = v;
                                        updateConfig("programs", newProgs);
                                    }} required />
                                    <TextArea label="Deskripsi" value={prog.description} onChange={(v) => {
                                        const newProgs = [...config.programs];
                                        newProgs[idx].description = v;
                                        updateConfig("programs", newProgs);
                                    }} required />
                                    <ImageUploader label="Gambar Program (Opsional)" value={prog.image_url} onChange={(v) => {
                                        const newProgs = [...config.programs];
                                        newProgs[idx].image_url = v;
                                        updateConfig("programs", newProgs);
                                    }} />
                                </div>
                            ))}
                            {(!config.programs || config.programs.length === 0) && (
                                <p className="text-xs text-zinc-400">Belum ada program kustom. Program default akan ditampilkan.</p>
                            )}
                        </div>
                    )}

                    {/* Branch Info Section */}
                    {config.show_locations && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                            <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">Informasi Tambahan Cabang</h3>
                            <p className="text-xs text-zinc-500">Anda dapat melengkapi informasi jam operasional dan kontak untuk setiap cabang yang akan tampil di landing page.</p>
                            {branches.map((b) => {
                                const bInfo = (config.branch_info || []).find((info: any) => info.id === b.id) || { id: b.id, hours: "", phone: "", email: "", features: [] };
                                const setBInfo = (newInfo: any) => {
                                    const current = [...(config.branch_info || [])];
                                    const idx = current.findIndex(x => x.id === b.id);
                                    if (idx >= 0) current[idx] = newInfo;
                                    else current.push(newInfo);
                                    updateConfig("branch_info", current);
                                };
                                return (
                                    <div key={b.id} className="p-4 border border-zinc-100 rounded-lg space-y-3 bg-zinc-50">
                                        <p className="text-sm font-semibold text-zinc-800">{b.name}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <TextInput label="Jam Operasional" placeholder="Sen-Jum: 06.00-22.00" value={bInfo.hours || ""} onChange={(v) => setBInfo({...bInfo, hours: v})} />
                                            <TextInput label="No Telepon / WA" placeholder="08123456789" value={bInfo.phone || ""} onChange={(v) => setBInfo({...bInfo, phone: v})} />
                                            <TextInput label="Email Cabang" placeholder="cabang@gym.com" value={bInfo.email || ""} onChange={(v) => setBInfo({...bInfo, email: v})} />
                                            <TextInput label="Fasilitas (pisahkan dengan koma)" placeholder="Parkir luas, Shower, AC" value={(bInfo.features || []).join(", ")} onChange={(v) => setBInfo({...bInfo, features: v.split(",").map((s: string) => s.trim()).filter(Boolean)})} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Testimonials */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h3 className="text-base font-bold text-zinc-800">Testimoni</h3>
                            <button type="button" onClick={() => updateConfig("testimonials", [...(config.testimonials || []), { name: "", role: "", text: "", avatar_url: "" }])} className="text-xs text-aksen-secondary font-semibold hover:underline flex items-center gap-1">
                                <IconPlus size={14} /> Tambah Testimoni
                            </button>
                        </div>
                        {(config.testimonials || []).map((testi: any, idx: number) => (
                            <div key={idx} className="p-4 border border-zinc-100 rounded-lg space-y-3 bg-zinc-50 relative">
                                <button type="button" onClick={() => {
                                    const newData = [...config.testimonials];
                                    newData.splice(idx, 1);
                                    updateConfig("testimonials", newData);
                                }} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                    <IconTrash size={16} />
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <TextInput label="Nama" value={testi.name} onChange={(v) => {
                                        const newData = [...config.testimonials];
                                        newData[idx].name = v;
                                        updateConfig("testimonials", newData);
                                    }} required />
                                    <TextInput label="Peran (Cth: Member)" value={testi.role} onChange={(v) => {
                                        const newData = [...config.testimonials];
                                        newData[idx].role = v;
                                        updateConfig("testimonials", newData);
                                    }} required />
                                </div>
                                <TextArea label="Isi Testimoni" value={testi.text} onChange={(v) => {
                                    const newData = [...config.testimonials];
                                    newData[idx].text = v;
                                    updateConfig("testimonials", newData);
                                }} required />
                                <ImageUploader label="Foto Profil (Opsional)" value={testi.avatar_url} onChange={(v) => {
                                    const newData = [...config.testimonials];
                                    newData[idx].avatar_url = v;
                                    updateConfig("testimonials", newData);
                                }} />
                            </div>
                        ))}
                        {(!config.testimonials || config.testimonials.length === 0) && (
                            <p className="text-xs text-zinc-400">Belum ada testimoni kustom. Testimoni default akan ditampilkan.</p>
                        )}
                    </div>

                    {/* FAQ */}
                    {config.show_faq && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                <h3 className="text-base font-bold text-zinc-800">FAQ (Pertanyaan Umum)</h3>
                                <button type="button" onClick={() => updateConfig("faqs", [...(config.faqs || []), { q: "", a: "" }])} className="text-xs text-aksen-secondary font-semibold hover:underline flex items-center gap-1">
                                    <IconPlus size={14} /> Tambah FAQ
                                </button>
                            </div>
                            {(config.faqs || []).map((faq: any, idx: number) => (
                                <div key={idx} className="p-4 border border-zinc-100 rounded-lg space-y-3 bg-zinc-50 relative">
                                    <button type="button" onClick={() => {
                                        const newData = [...config.faqs];
                                        newData.splice(idx, 1);
                                        updateConfig("faqs", newData);
                                    }} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                        <IconTrash size={16} />
                                    </button>
                                    <TextInput label="Pertanyaan" value={faq.q} onChange={(v) => {
                                        const newData = [...config.faqs];
                                        newData[idx].q = v;
                                        updateConfig("faqs", newData);
                                    }} required />
                                    <TextArea label="Jawaban" value={faq.a} onChange={(v) => {
                                        const newData = [...config.faqs];
                                        newData[idx].a = v;
                                        updateConfig("faqs", newData);
                                    }} required />
                                </div>
                            ))}
                            {(!config.faqs || config.faqs.length === 0) && (
                                <p className="text-xs text-zinc-400">Belum ada FAQ kustom. FAQ default akan ditampilkan.</p>
                            )}
                        </div>
                    )}

                    {/* Footer & Socials */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                        <h3 className="text-base font-bold text-zinc-800 border-b border-zinc-100 pb-2">Footer & Sosial Media</h3>
                        <TextArea 
                            label="Deskripsi Singkat Footer" 
                            value={config.footer?.description || ""} 
                            onChange={(v) => updateConfig("footer", { ...config.footer, description: v })} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput 
                                label="Link Instagram" 
                                placeholder="https://instagram.com/gym"
                                value={config.footer?.instagram || ""} 
                                onChange={(v) => updateConfig("footer", { ...config.footer, instagram: v })} 
                            />
                            <TextInput 
                                label="Link WhatsApp" 
                                placeholder="https://wa.me/628123456"
                                value={config.footer?.whatsapp || ""} 
                                onChange={(v) => updateConfig("footer", { ...config.footer, whatsapp: v })} 
                            />
                            <TextInput 
                                label="Link Facebook" 
                                placeholder="https://facebook.com/gym"
                                value={config.footer?.facebook || ""} 
                                onChange={(v) => updateConfig("footer", { ...config.footer, facebook: v })} 
                            />
                            <TextInput 
                                label="Link Twitter/X" 
                                placeholder="https://x.com/gym"
                                value={config.footer?.twitter || ""} 
                                onChange={(v) => updateConfig("footer", { ...config.footer, twitter: v })} 
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <CustomButton
                            type="submit"
                            disabled={saving}
                            className="px-6 text-white h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
                        </CustomButton>
                    </div>
                </div>
            </div>
        </form>
    );
}

// ── Helpers UI ──

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer hover:bg-zinc-100/50 p-2 rounded-lg transition-all">
            <span className="text-sm font-semibold text-zinc-700">{label}</span>
            <input 
                type="checkbox" 
                className="toggle toggle-success toggle-sm"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
}

function TextInput({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean, placeholder?: string }) {
    return (
        <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input 
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-aksen-secondary transition-all text-zinc-800 font-semibold"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
}

function TextArea({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean, placeholder?: string }) {
    return (
        <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
            <textarea 
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-aksen-secondary transition-all text-zinc-800 h-24"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
}

function ImageUploader({ label, value, onChange }: { label: string; value: string | undefined; onChange: (v: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await tenantAPI.uploadLandingImage(file);
            onChange(res.image_url);
            toast.success("Gambar berhasil diupload!");
        } catch (err) {
            toast.error("Gagal mengupload gambar.");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    return (
        <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200">
                        <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-300">
                        <IconUpload size={24} />
                    </div>
                )}
                <div className="flex-1">
                    <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} className="hidden" />
                    <button 
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md text-xs font-semibold transition-all"
                    >
                        {uploading ? "Mengupload..." : "Pilih Gambar"}
                    </button>
                    {value && (
                        <button 
                            type="button"
                            onClick={() => onChange("")}
                            className="ml-2 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-xs font-semibold transition-all"
                        >
                            Hapus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
