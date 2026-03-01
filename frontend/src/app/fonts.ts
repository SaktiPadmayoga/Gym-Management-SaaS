// app/fonts.ts
import { Atkinson_Hyperlegible_Mono, Outfit, Figtree } from "next/font/google";

export const figtree = Figtree({
    subsets: ["latin"],
    variable: "--font-figtree",
});

export const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    variable: "--font-outfit",
});

export const atkin = Atkinson_Hyperlegible_Mono({
    subsets: ["latin"],
    variable: "--font-atkin",
});
