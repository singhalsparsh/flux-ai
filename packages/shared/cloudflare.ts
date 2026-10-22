/**
 * Cloudflare-compatible Geo type
 *
 * Replaces @vercel/functions Geo import in workspace packages
 * to avoid build errors on Cloudflare Workers.
 *
 * Import from this module instead of '@vercel/functions' in shared packages.
 */
export interface Geo {
    city?: string
    country?: string
    region?: string
    latitude?: string
    longitude?: string
    flag?: string
    countryRegion?: string
}
