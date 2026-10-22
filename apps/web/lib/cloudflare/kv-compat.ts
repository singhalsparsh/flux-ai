/**
 * Cloudflare KV compatibility layer for @vercel/kv
 * This allows the app to use Cloudflare KV instead of Vercel KV
 */

// @ts-ignore - Cloudflare KV adapter
type Kv = any

interface CloudflareKvOptions {
  url?: string
  token?: string
  namespace?: string
}

class CloudflareKvAdapter {
  private namespace: any
  private url?: string
  private token?: string

  constructor(options: CloudflareKvOptions = {}) {
    this.url = options.url
    this.token = options.token
    // @ts-ignore - Cloudflare KV binding
    this.namespace = options.namespace || (globalThis as any).FLUXAI_KV
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.namespace) {
        const value = await this.namespace.get(key)
        return value ? JSON.parse(value) : null
      }
      return null
    } catch (error) {
      console.error('Cloudflare KV get error:', error)
      return null
    }
  }

  async set<T = any>(key: string, value: T, options?: { ex?: number }): Promise<void> {
    try {
      if (this.namespace) {
        const stringValue = JSON.stringify(value)
        await this.namespace.put(key, stringValue, {
          expirationTtl: options?.ex || 86400
        })
      }
    } catch (error) {
      console.error('Cloudflare KV set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.namespace) {
        await this.namespace.delete(key)
      }
    } catch (error) {
      console.error('Cloudflare KV delete error:', error)
    }
  }
}

// Export a compatible Kv interface
export const kv: Kv = new CloudflareKvAdapter() as any

// Export the type for compatibility
export type { Kv }
export { CloudflareKvAdapter }