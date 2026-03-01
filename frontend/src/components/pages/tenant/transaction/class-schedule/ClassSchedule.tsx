// File: src/app/pt-sessions/page.tsx
"use client";

import { useState, useMemo } from "react";
import { DUMMY_PT_SESSIONS } from "@/lib/dummy/ptSessionDummy";
import { DUMMY_CLASS_PLANS } from "@/lib/dummy/classPlanDummy";
// import { ProfileData } from "@/lib/dummy/profileDummy";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import { DUMMY_CLASS_SCHEDULES } from "@/lib/dummy/classScheduleDummy";
import { ClassScheduleData } from "@/types/class-schedule";

interface ScheduleCard {
    id: string;
    time: string;
    memberName: string;
    className: string;
    classPrice: number;
    duration: number;
    maxVisitor: number;
    status: "Active" | "Inactive";
}

export default function ClassSchedule() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    /* =======================
       HELPER FUNCTIONS
    ======================= */
    // const getMemberName = (profileId?: string) => {
    //     return ProfileData.find((p) => p.id === profileId)?.name ?? "-";
    // };

    const getClassName = (planId?: string) => {
        return DUMMY_CLASS_PLANS.find((p) => p.id === planId)?.name ?? "-";
    };

    const getClassPrice = (planId?: string) => {
        return DUMMY_CLASS_PLANS.find((p) => p.id === planId)?.price ?? 0;
    };

    const getClassDuration = (planId?: string) => {
        return DUMMY_CLASS_PLANS.find((p) => p.id === planId)?.minutesPerSession ?? 0;
    };

    const getClassMaxVisitor = (planId?: string) => {
        return DUMMY_CLASS_PLANS.find((p) => p.id === planId)?.maxVisitor ?? 0;
    };

    /* =======================
       CALENDAR LOGIC
    ======================= */
    const getWeekDates = (startDate: Date) => {
        const dates = [];
        const start = new Date(startDate);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(selectedDate);

    const getDayName = (date: Date) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[date.getDay()];
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
    };

    /* =======================
       TIME SLOTS
    ======================= */
    const timeSlots = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "6:30 PM", "7:00 PM", "8:00 PM"];
    const getSchedulesForDate = (date: Date): ClassScheduleData[] => {
        const dateStr = formatISODate(date);
        return DUMMY_CLASS_SCHEDULES.filter((schedule) => schedule.date === dateStr);
    };

    const getSchedulesByTime = (date: Date, time: string): ClassScheduleData[] => {
        return getSchedulesForDate(date).filter((schedule) => formatTimeToSlot(schedule.startAt) === time);
    };

    const formatISODate = (date: Date) => date.toISOString().split("T")[0];

    const formatTimeToSlot = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    // const getInstructorName = (profileId?: string) => {
    //     return ProfileData.find((p) => p.id === profileId)?.name ?? "-";
    // };

    return (
        <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
            <Toaster position="top-center" />

            {/* Breadcrumb */}
            <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                <ul>
                    <li>Transaction</li>
                    <li className="text-aksen-secondary">Class Schedule</li>
                </ul>
            </div>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">Class Schedule</h1>
                    <p className="text-zinc-500">you can see all class here</p>
                </div>

                <div className="flex justify-between gap-4">
                    <div className="flex gap-2 text-gray-800">
                        <input
                            type="date"
                            value={selectedDate.toISOString().split("T")[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-aksen-primary placeholder:text-gray-800"
                        />
                    </div>
                    <CustomButton iconName="plus" className="text-white px-6 py-2" onClick={() => router.push("/class-schedule/create")}>
                        Add New Class
                    </CustomButton>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto rounded-xl">
                <div className="min-w-max">
                    {/* Days Header */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <div className="w-22 p-2 flex items-center border-r justify-center border-gray-200 bg-gray-50"></div>
                        {weekDates.map((date) => (
                            <div key={date.toISOString()} className="flex-1 w-34 p-4 border-r border-gray-200 text-center">
                                <p className="font-semibold text-gray-900">
                                    {getDayName(date)}, {formatDate(date)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map((time) => (
                        <div key={time} className="flex border-b border-gray-200 h-12 ">
                            {/* Time Label */}
                            <div className="w-22 p-2 border-r flex items-center justify-center border-gray-200 text-sm text-gray-600 font-medium bg-gray-50">{time}</div>

                            {/* Schedule Cards for Each Day */}
                            {weekDates.map((date) => {
                                const schedules = getSchedulesByTime(date, time);

                                return (
                                    <div key={date.toISOString()} className="flex-1 w-34 p-2 border-r border-gray-200">
                                        <div className="space-y-2">
                                            {schedules.map((schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    onClick={() => router.push(`/class-schedule/${schedule.id}`)}
                                                    className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded cursor-pointer hover:shadow-md hover:bg-blue-100 transition"
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-blue-900 text-sm">{getClassName(schedule.planId)}</p>
                                                            {/* <p className="text-xs text-blue-700">Instructor: {getInstructorName(schedule.instructorId)}</p> */}
                                                            <p className="text-xs text-blue-700">
                                                                {getClassDuration(schedule.planId)} mins • Max {getClassMaxVisitor(schedule.planId)}
                                                            </p>
                                                            <p className="text-xs text-blue-700 font-medium">Rp {getClassPrice(schedule.planId).toLocaleString("id-ID")}</p>
                                                        </div>

                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                                                                schedule.status === "Scheduled" ? "bg-green-100 text-green-700" : schedule.status === "Completed" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {schedule.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        const prev = new Date(selectedDate);
                        prev.setDate(prev.getDate() - 7);
                        setSelectedDate(prev);
                    }}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
                >
                    ← Previous Week
                </button>

                <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
                    Today
                </button>

                <button
                    onClick={() => {
                        const next = new Date(selectedDate);
                        next.setDate(next.getDate() + 7);
                        setSelectedDate(next);
                    }}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
                >
                    Next Week →
                </button>
            </div>
        </div>
    );
}
