import { Customer } from "@/types/pos";

export const CATEGORIES = ["All Categories", "Electronics", "Clothing", "Books"];

export const BRANDS = ["All Brands", "Apple", "Samsung", "Sony"];

export const TAX_RATE = 0.1; // 10%

export const DEFAULT_WALK_IN_CUSTOMER: Customer = {
    id: "0",
    name: "Walk-in Customer",
    email: "walkin@default.com",
    phone: "00000000000",
    type: "walk-in",
};
