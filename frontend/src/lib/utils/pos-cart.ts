import { CartItem } from "@/types/tenant/pos";

export function getItemPrice(item: CartItem): number {
    switch (item.type) {
        case "product":    return item.data.sellingPrice * item.quantity;
        case "membership": return item.data.price;
        case "pt_package": return item.data.price;
    }
}

export function getItemName(item: CartItem): string {
    return item.data.name;
}

export function getItemId(item: CartItem): string {
    return item.data.id;
}

export function calcSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + getItemPrice(item), 0);
}