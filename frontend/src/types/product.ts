import * as z from "zod";

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

export type ProductData = z.infer<typeof ProductSchema>;
export type ProductDataWithKeyword = z.infer<typeof ProductSchema> & {
    keyword: string;
};
