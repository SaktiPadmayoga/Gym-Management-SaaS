/**
 * Module declaration shim for `html-to-image`.
 * The package does not have an "exports" field in its package.json,
 * which causes TypeScript's "bundler" moduleResolution to fail.
 * This file re-declares the module so TypeScript resolves it correctly.
 */
declare module "html-to-image" {
    interface Options {
        width?: number;
        height?: number;
        style?: Partial<CSSStyleDeclaration>;
        quality?: number;
        backgroundColor?: string;
        canvasWidth?: number;
        canvasHeight?: number;
        type?: string;
        filter?: (domNode: HTMLElement) => boolean;
        pixelRatio?: number;
        cacheBust?: boolean;
        includeQueryParams?: boolean;
        imagePlaceholder?: string;
        skipFonts?: boolean;
        preferredFontFormat?: string;
        fontEmbedCSS?: string;
        workerUrl?: string | null;
        httpTimeout?: number;
        fetchRequestInit?: RequestInit;
    }

    function toSvg<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
    function toCanvas<T extends HTMLElement>(node: T, options?: Options): Promise<HTMLCanvasElement>;
    function toPixelData<T extends HTMLElement>(node: T, options?: Options): Promise<Uint8ClampedArray>;
    function toPng<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
    function toJpeg<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
    function toBlob<T extends HTMLElement>(node: T, options?: Options): Promise<Blob | null>;
    function getFontEmbedCSS<T extends HTMLElement>(node: T, options?: Options): Promise<string>;
}
