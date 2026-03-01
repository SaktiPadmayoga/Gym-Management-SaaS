import { FacilityData } from "@/types/facility";

export const DUMMY_FACILITIES: FacilityData[] = [
    {
        id: "FC-001",
        name: "Yoga Studio",
        description: "Spacious yoga studio for group classes",
        classType: "public",
        price: 50000,
        minutesPerSession: 60,
        operationalHourFrom: "06:00",
        operationalHourUntil: "22:00",
    },
    {
        id: "FC-002",
        name: "Private PT Room",
        description: "Exclusive room for personal training",
        classType: "private",
        price: 150000,
        minutesPerSession: 60,
        operationalHourFrom: "08:00",
        operationalHourUntil: "21:00",
    },
    {
        id: "FC-003",
        name: "Spinning Room",
        description: "High intensity cycling facility",
        classType: "public",
        price: 75000,
        minutesPerSession: 45,
        operationalHourFrom: "07:00",
        operationalHourUntil: "20:00",
    },
];
