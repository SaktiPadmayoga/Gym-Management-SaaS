import * as z from "zod";

/** ===== ENUM ===== */
export const FacilityClassTypeEnum = z.enum(["public", "private"]);

/** ===== SCHEMA ===== */
export const FacilitySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),

    classType: FacilityClassTypeEnum,

    price: z.number().nonnegative(),
    minutesPerSession: z.number().int().positive(),

    operationalHourFrom: z.string(), // HH:mm
    operationalHourUntil: z.string(), // HH:mm
});

/** ===== TYPE ===== */
export type FacilityData = z.infer<typeof FacilitySchema>;
export type FacilityDataWithKeyword = FacilityData & {
    keyword: string;
};
