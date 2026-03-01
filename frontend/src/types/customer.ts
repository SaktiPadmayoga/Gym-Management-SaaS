// File: src/types/customer.ts
import { z } from "zod";

// Customer Type Enum
export const CustomerTypeEnum = z.enum(["walk-in", "registered", "corporate"]);

// Zod Schemas
export const CustomerSchema = z.object({
    id: z.string().min(1, "Customer ID is required"),
    name: z.string().min(1, "Customer name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number must be at least 8 characters").max(20, "Phone number too long"),
    type: CustomerTypeEnum.default("walk-in"),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const CreateCustomerSchema = CustomerSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CustomerListSchema = z.array(CustomerSchema);

// TypeScript Types (inferred from Zod schemas)
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CustomerType = z.infer<typeof CustomerTypeEnum>;
export type CustomerList = z.infer<typeof CustomerListSchema>;

// Utility type untuk customer form
export type CustomerFormData = Omit<Customer, "id" | "createdAt" | "updatedAt">;

// Export schemas untuk validation
export const CustomerSchemas = {
    Customer: CustomerSchema,
    CreateCustomer: CreateCustomerSchema,
    UpdateCustomer: UpdateCustomerSchema,
    CustomerList: CustomerListSchema,
} as const;
