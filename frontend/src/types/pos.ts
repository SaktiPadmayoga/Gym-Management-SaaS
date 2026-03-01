// File: src/types/pos.ts
import { z } from "zod";

// Zod Schemas
export const ProductSchema = z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    sellingPrice: z.number().positive("Price must be positive"),
    costPrice: z.number().positive("Cost price must be positive"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    category: z.string().min(1, "Category is required"),
    image: z.file().optional,
    description: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const CartItemSchema = z.object({
    product: ProductSchema,
    quantity: z.number().int().positive("Quantity must be at least 1"),
});

// Lazy reference to avoid circular dependency
export const POSSessionSchema = z.lazy(() =>
    z.object({
        id: z.string().min(1, "Session ID is required"),
        counter: z.string().min(1, "Counter is required"),
        branch: z.string().min(1, "Branch is required"),
        startTime: z.date(),
        endTime: z.date().optional(),
        customer: z
            .object({
                id: z.string(),
                name: z.string(),
                email: z.string().email(),
                phone: z.string(),
                type: z.enum(["walk-in", "registered", "corporate"]),
            })
            .nullable(),
        items: z.array(CartItemSchema),
        subtotal: z.number().min(0),
        tax: z.number().min(0),
        total: z.number().min(0),
        discount: z.number().min(0).default(0),
        notes: z.string().optional(),
        status: z.enum(["active", "completed", "cancelled"]).default("active"),
    }),
);

export const CustomerSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    type: z.enum(["walk-in", "registered"]),
});

// TypeScript Types (inferred from Zod schemas)
export type Product = z.infer<typeof ProductSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type POSSession = z.infer<typeof POSSessionSchema>;
export type Customer = z.infer<typeof CustomerSchema>;

// Export schemas for validation
export const Schemas = {
    Product: ProductSchema,
    CartItem: CartItemSchema,
    POSSession: POSSessionSchema,
    Customer: CustomerSchema,
} as const;
