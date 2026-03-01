import * as z from "zod";

// --- Sub-Schemas for Relations ---
// Sesuai dengan MemberProfile Model
export const memberProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
    photoProfile: z.string().nullable().optional(),
    status: z.enum(["active", "inactive", "suspended", "banned"]),
});

// Sesuai dengan Staff Model
export const staffSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    staffType: z.enum(["trainer", "receptionist", "admin", "manager", "maintenance"]),
    status: z.enum(["active", "inactive", "resigned", "terminated"]),
});

// --- Main User Schema (Response) ---
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(["owner", "admin", "trainer", "receptionist", "member"]),
    isActive: z.boolean(),
    emailVerifiedAt: z.string().nullable(),

    // Relations (Optional karena menggunakan whenLoaded di backend)
    memberProfile: memberProfileSchema.nullable().optional(),
    staff: staffSchema.nullable().optional(),

    createdAt: z.string(),
    updatedAt: z.string(),
});

// --- Request Schemas ---

export const userCreateSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    role: z.enum(["owner", "admin", "trainer", "receptionist", "member"]),
    isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).optional().or(z.literal("")), // Optional on update
    role: z.enum(["owner", "admin", "trainer", "receptionist", "member"]),
    isActive: z.boolean(),
});

// --- Types Export ---
export type UserData = z.infer<typeof userSchema>;
export type UserCreateRequest = z.infer<typeof userCreateSchema>;
export type UserUpdateRequest = z.infer<typeof userUpdateSchema>;
