// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Bell } from "lucide-react";
// import { useTenantNotifications, useMarkTenantNotificationRead, useMarkAllTenantNotificationsRead } from "@/hooks/tenant/useTenantNotifications";
// import dayjs from "dayjs";

// export default function MemberNotificationBell() {
//     const [isOpen, setIsOpen] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     const { data } = useTenantNotifications();
//     const markAsRead = useMarkTenantNotificationRead();
//     const markAllAsRead = useMarkAllTenantNotificationsRead();

//     const unreadCount = data?.unread_count || 0;
//     const notifications = data?.notifications || [];

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const handleMarkAllRead = () => {
//         markAllAsRead.mutate();
//     };

//     const handleMarkRead = (id: string, isRead: boolean) => {
//         if (!isRead) {
//             markAsRead.mutate(id);
//         }
//     };

//     return (
//         <div className="relative" ref={dropdownRef}>
//             <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors relative group">
//                 <Bell className="w-5 h-5 group-hover:animate-swing" />
//                 {unreadCount > 0 && (
//                     <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[9px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
//                 )}
//             </button>

//             {isOpen && (
//                 <>
//                     <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/5 backdrop-blur-[1px] transition-opacity duration-200 z-40 sm:hidden" />

//                     <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
//                         <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
//                             <h3 className="font-bold text-zinc-800 tracking-tight">Notifikasi</h3>
//                             <button
//                                 className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
//                                 onClick={handleMarkAllRead}
//                                 disabled={unreadCount === 0 || markAllAsRead.isPending}
//                             >
//                                 Tandai Dibaca
//                             </button>
//                         </div>

//                         <div className="max-h-[380px] overflow-y-auto">
//                             {notifications.length === 0 ? (
//                                 <div className="p-8 text-center flex flex-col items-center justify-center">
//                                     <Bell size={32} className="text-zinc-200 mb-3" />
//                                     <p className="text-sm font-medium text-zinc-500">Semua tenang di sini.</p>
//                                     <p className="text-xs text-zinc-400 mt-1">Belum ada aktivitas terbaru.</p>
//                                 </div>
//                             ) : (
//                                 notifications.map((notif: any) => (
//                                     <div
//                                         key={notif.id}
//                                         onClick={() => handleMarkRead(notif.id, notif.is_read)}
//                                         className={`p-4 border-b border-zinc-50 flex gap-3 cursor-pointer hover:bg-zinc-50 transition-colors ${!notif.is_read ? "bg-blue-50/20" : ""}`}
//                                     >
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex justify-between items-start gap-2">
//                                                 <p className={`text-sm tracking-tight ${!notif.is_read ? "font-bold text-zinc-900" : "font-medium text-zinc-700"}`}>{notif.title}</p>
//                                                 {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
//                                             </div>

//                                             <p className={`text-xs mt-1 leading-relaxed ${!notif.is_read ? "text-zinc-600" : "text-zinc-500"}`}>{notif.message}</p>

//                                             <div className="flex items-center gap-2 mt-2.5">
//                                                 <span className="text-[10px] font-medium text-zinc-400">{dayjs(notif.created_at).locale("id").format("DD MMM YYYY, HH:mm")}</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }
