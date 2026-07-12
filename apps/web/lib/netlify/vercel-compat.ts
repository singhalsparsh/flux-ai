/**
 * Vercel → Netlify compatibility layer
 *
 * Replaces Vercel-specific APIs with Netlify equivalents
 * so the app can run on Netlify.
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
 * Netlify-compatible geolocation function.
 * Netlify provides geolocation through x-nf-geo-* headers.
 * Falls back gracefully when not available.
 */
export function geolocation(request: Request): Geo {
  // Netlify injects geo headers into the request
  return {
    city: request.headers.get('x-nf-geo-city') ?? request.headers.get('x-vercel-ip-city') ?? undefined,
    country: request.headers.get('x-nf-geo-country-code') ?? request.headers.get('x-vercel-ip-country') ?? undefined,
    region: request.headers.get('x-nf-geo-region-code') ?? request.headers.get('x-vercel-ip-country-region') ?? undefined,
    latitude: request.headers.get('x-nf-geo-latitude') ?? request.headers.get('x-vercel-ip-latitude') ?? undefined,
    longitude: request.headers.get('x-nf-geo-longitude') ?? request.headers.get('x-vercel-ip-longitude') ?? undefined,
  }
}

/**
 * Re-exported for drop-in compatibility.
 * Configured as a package alias in next.config.mjs
 * when running on Netlify.
 */
export { geolocation as default }
