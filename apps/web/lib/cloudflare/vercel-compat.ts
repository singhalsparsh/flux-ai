/**
 * Vercel → Cloudflare compatibility layer
 *
 * Replaces Vercel-specific APIs with Cloudflare Workers equivalents
 * so the app can run on Cloudflare Pages/Workers.
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

/**
 * Cloudflare-compatible geolocation function.
 * In Cloudflare Workers, geolocation data comes from request.cf.
 * Falls back gracefully when not available (dev/PowerShell).
 */
export function geolocation(request: Request): Geo {
  // Cloudflare Workers populate request.cf with geo data
  const cf = (request as any)?.cf
  if (cf) {
    return {
      city: cf.city,
      country: cf.country,
      region: cf.region,
      latitude: cf.latitude,
      longitude: cf.longitude,
      flag: cf.flag,
      countryRegion: cf.regionCode,
    }
  }

  // Fallback: try x-vercel-* headers (local dev)
  return {
    city: request.headers.get('x-vercel-ip-city') ?? undefined,
    country: request.headers.get('x-vercel-ip-country') ?? undefined,
    region: request.headers.get('x-vercel-ip-country-region') ?? undefined,
    latitude: request.headers.get('x-vercel-ip-latitude') ?? undefined,
    longitude: request.headers.get('x-vercel-ip-longitude') ?? undefined,
  }
}

/**
 * Re-exported for drop-in compatibility.
 * If the original code imports from '@vercel/functions',
 * you can also configure this as a package alias in next.config.mjs.
 */
export { geolocation as default }
