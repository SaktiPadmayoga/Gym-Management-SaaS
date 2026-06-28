"use client";

import { useState } from 'react';

import { Bell, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { useCentralNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useCentralNotification';
import dayjs from 'dayjs';
import { useRouter } from "next/navigation";
import { useAdminAuth } from '@/providers/AdminAuthProvider';



export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { admin } = useAdminAuth();
  const { data } = useCentralNotifications(!!admin); // hanya fetch jika sudah login

  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const unreadCount = data?.unread_count || 0;
  const notifications = data?.notifications || [];
  const router = useRouter();
  const goToDomainRequests = () => {
    router.push("/admin/domains?tab=requests");
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const handleMarkRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_success': return <DollarSign size={16} className="text-green-600" />;
      case 'new_tenant': return <CheckCircle size={16} className="text-aksen-secondary" />;
      case 'new_domain_request': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <AlertTriangle size={16} className="text-orange-600" />;
    }
  };

  return (
    <div className="relative">
      {/* BELL ICON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-zinc-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* OVERLAY + DROPDOWN */}
      {isOpen && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-200 ease-out animate-fadeIn"
          />

          {/* DROPDOWN PANEL */}
          <div
            className="
              absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden
              transform transition-all duration-200 ease-out
              animate-dropdownIn
            "
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-zinc-800">Notifikasi</h3>
              <button
                className="text-xs text-aksen-secondary hover:text-aksen-dark font-medium cursor-pointer"
                onClick={handleMarkAllRead}
              >
                Tandai semua dibaca
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  Belum ada notifikasi
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`p-4 border-b border-gray-50 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notif.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div>
                      <p className={`text-sm ${!notif.is_read ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
                        {notif.title}
                      </p>

                      <p className="text-xs text-zinc-500 mt-1">
                        {notif.message}
                      </p>

                      {/* 🔥 KHUSUS DOMAIN REQUEST */}
                      {notif.type === "new_domain_request" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDomainRequests();
                          }}
                          className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-600 underline underline-offset-4"
                        >
                          Lihat Permintaan Domain →
                        </button>
                      )}

                      <p className="text-[10px] text-zinc-400 mt-2">
                        {dayjs(notif.created_at).format('DD MMM YYYY, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}