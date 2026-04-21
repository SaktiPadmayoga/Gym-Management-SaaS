import { z } from "zod";

// Base item types
export const ProductItemSchema = z.object({
    type: z.literal("product"),
    id: z.string().uuid(),
    name: z.string(),
    sellingPrice: z.number().positive(),
    stock: z.number().int().min(0),
    category: z.string(),
    image: z.string().nullable().optional(),
});

export const MembershipItemSchema = z.object({
    type: z.literal("membership"),
    id: z.string().uuid(),
    name: z.string(),
    price: z.number().positive(),
    duration: z.number(),
    duration_unit: z.enum(["day", "week", "month", "year"]),
    category: z.string(),
});

export const PtPackageItemSchema = z.object({
    type: z.literal("pt_package"),
    id: z.string().uuid(),
    name: z.string(),
    price: z.number().positive(),
    total_sessions: z.number(),
    duration: z.number(),
    duration_unit: z.enum(["day", "week", "month", "year"]),
});

export const CartItemSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("product"),    data: ProductItemSchema,    quantity: z.number().int().min(1) }),
    z.object({ type: z.literal("membership"), data: MembershipItemSchema, quantity: z.literal(1) }),
    z.object({ type: z.literal("pt_package"), data: PtPackageItemSchema,  quantity: z.literal(1) }),
]);

export const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    type: z.enum(["walk-in", "registered"]),
});

export type ProductItem    = z.infer<typeof ProductItemSchema>;
export type MembershipItem = z.infer<typeof MembershipItemSchema>;
export type PtPackageItem  = z.infer<typeof PtPackageItemSchema>;
export type CartItem       = z.infer<typeof CartItemSchema>;
export type Customer       = z.infer<typeof CustomerSchema>;

export const POSSessionSchema = z.lazy(() =>
    z.object({
        id: z.string(),
        counter: z.string(),
        branch: z.string(),
        startTime: z.date(),
        endTime: z.date().optional(),
        customer: CustomerSchema.nullable(),
        items: z.array(CartItemSchema),
        subtotal: z.number().min(0),
        tax: z.number().min(0),
        total: z.number().min(0),
        discount: z.number().min(0).default(0),
        notes: z.string().optional(),
        status: z.enum(["active", "completed", "cancelled"]).default("active"),
    }),
);

export type POSSession = z.infer<typeof POSSessionSchema>;