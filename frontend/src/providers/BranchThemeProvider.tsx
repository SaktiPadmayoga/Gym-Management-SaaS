"use client";

/**
 * BranchThemeProvider
 * 
 * Fetches public branch settings (primary_color, accent_color) and injects
 * them as CSS variables into the document, overriding the static Tailwind
 * @theme defaults at runtime.
 * 
 * Works by injecting a <style> tag with:
 *   :root { --color-aksen-primary: ...; --color-aksen-secondary: ...; }
 * 
 * This overrides the static values in globals.css since specificity is equal
 * but runtime injection happens after stylesheet load.
 */

import { useEffect } from "react";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import { useBranch } from "./BranchProvider";

const STYLE_TAG_ID = "branch-theme-vars";

// Default colors matching globals.css
const DEFAULT_PRIMARY   = "#00b7b5";
const DEFAULT_SECONDARY = "#018790";

function isValidHexColor(color: string | undefined | null): color is string {
    if (!color) return false;
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
}

export function BranchThemeInjector() {
    const { branchId } = useBranch();
    const { data: publicSettings } = usePublicBranchSettings(branchId ?? undefined);

    useEffect(() => {
        const primary   = publicSettings?.primary_color;
        const secondary = publicSettings?.accent_color;

        const resolvedPrimary   = isValidHexColor(primary)   ? primary   : DEFAULT_PRIMARY;
        const resolvedSecondary = isValidHexColor(secondary)  ? secondary : DEFAULT_SECONDARY;

        // Find or create the style tag
        let styleTag = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = STYLE_TAG_ID;
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            :root,
            html {
                --color-aksen-primary: ${resolvedPrimary};
                --color-aksen-secondary: ${resolvedSecondary};
            }
        `;
    }, [publicSettings, branchId]);

    // Cleanup on unmount (e.g. logout)
    useEffect(() => {
        return () => {
            const styleTag = document.getElementById(STYLE_TAG_ID);
            if (styleTag) {
                styleTag.remove();
            }
        };
    }, []);

    return null;
}
