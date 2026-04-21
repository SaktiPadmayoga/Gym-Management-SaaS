import * as z from "zod";

/* =========================
 * STOCK STATUS
 * ========================= */

export const StockStatusEnum = z.enum(["in_stock", "low_stock", "out_of_stock"]);

/* =========================
 * STOCK MOVEMENT SCHEMA
 * ========================= */

export const StockMovementSchema = z.object({
    id:             z.string(),
    type:           z.enum(["purchase", "sale", "adjustment", "return", "transfer"]),
    qty_before:     z.number(),
    qty_change:     z.number(),
    qty_after:      z.number(),
    is_incoming:    z.boolean(),
    notes:          z.string().nullable().optional(),
    reference_id:   z.string().nullable().optional(),
    reference_type: z.string().nullable().optional(),
    created_at:     z.string().optional(),
});

export type StockMovementData = z.infer<typeof StockMovementSchema>;

/* =========================
 * PRODUCT SCHEMA
 * ========================= */

export const ProductSchema = z.object({
    id:              z.string(),
    name:            z.string(),
    code:            z.string().nullable().optional(),
    category:        z.string(),
    description:     z.string().nullable().optional(),
    color:           z.string().nullable().optional(),
    sort_order:      z.number().default(0),
    branch_id:       z.string().nullable().optional(),

    selling_price:   z.string().or(z.number()),
    cost_price:      z.string().or(z.number()),
    currency:        z.string().default("IDR"),
    margin:          z.number().optional(),

    stock:           z.number(),
    min_stock:       z.number(),
    unit:            z.string().default("pcs"),
    stock_status:    StockStatusEnum.optional(),
    is_low_stock:    z.boolean().optional(),
    is_out_of_stock: z.boolean().optional(),

    image:           z.string().nullable().optional(),
    image_url:       z.string().nullable().optional(),

    is_active:       z.boolean(),
    created_at:      z.string().optional(),

    stock_movements: z.array(StockMovementSchema).optional(),
});

export type ProductData        = z.infer<typeof ProductSchema>;
export type ProductDataWithKeyword = ProductData & { search: string };

/* =========================
 * CREATE REQUEST
 * ========================= */

export const ProductCreateRequestSchema = z.object({
    name:          z.string().min(1),
    code:          z.string().optional(),
    category:      z.string().min(1),
    description:   z.string().optional(),
    color:         z.string().optional(),
    sort_order:    z.number().optional(),
    branch_id:     z.string().optional(),
    selling_price: z.number().min(0),
    cost_price:    z.number().min(0).optional(),
    currency:      z.string().optional(),
    stock:         z.number().min(0).optional(),
    min_stock:     z.number().min(0).optional(),
    unit:          z.string().optional(),
    is_active:     z.boolean().optional(),
    // image dikirim sebagai FormData file — tidak di schema ini
});

export type ProductCreateRequest = z.infer<typeof ProductCreateRequestSchema>;

/* =========================
 * UPDATE REQUEST
 * ========================= */

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

/* =========================
 * STOCK ACTION REQUESTS
 * ========================= */

export interface AddStockRequest {
    qty:   number;
    notes?: string;
}

export interface AdjustStockRequest {
    new_qty: number;
    notes?:  string;
}