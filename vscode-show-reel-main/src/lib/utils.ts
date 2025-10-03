import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Return an absolute URL for a given path or URL.
 * - If `value` is falsy, returns undefined.
 * - If `value` already looks like an absolute URL (http(s):// or //), returns it as-is
 * - If `value` is a root-relative path (`/path`), prefixes with current origin
 * - Otherwise prefixes with current origin and a leading `/`
 */
export function getAbsoluteUrl(value?: string, base?: string): string | undefined {
  if (!value) return undefined;
  // If a base is explicitly provided, prefer it. Otherwise prefer VITE_PUBLIC_BASE_URL if available
  const envBase = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_PUBLIC_BASE_URL;
  const baseUrl = base || envBase || (typeof window !== 'undefined' && window.location ? window.location.origin : undefined);

  try {
    // If it's already an absolute URL, the URL constructor will succeed
    const u = new URL(value);
    return u.toString();
  } catch (e) {
    // Not an absolute URL — build one relative to baseUrl if available
    if (!baseUrl) return value;
    if (value.startsWith('/')) return baseUrl.replace(/\/$/, '') + value;
    return baseUrl.replace(/\/$/, '') + '/' + value;
  }
}
