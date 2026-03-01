import { Schemas } from "@/types/pos";
import { ZodError, ZodSchema } from "zod";

export class POSValidator {
    private static validate<T>(schema: ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
        try {
            const validatedData = schema.parse(data);
            return { success: true, data: validatedData };
        } catch (error) {
            if (error instanceof ZodError) {
                return { success: false };
            }
            return { success: false, error: "Unknown validation error" };
        }
    }

    static validateProduct(data: unknown) {
        return this.validate(Schemas.Product, data);
    }

    static validateCartItem(data: unknown) {
        return this.validate(Schemas.CartItem, data);
    }

    static validateCustomer(data: unknown) {
        return this.validate(Schemas.Customer, data);
    }

    static validateSession(data: unknown) {
        return this.validate(Schemas.POSSession, data);
    }

    static validateProducts(data: unknown) {
        return this.validate(Schemas.Product.array(), data);
    }
}
