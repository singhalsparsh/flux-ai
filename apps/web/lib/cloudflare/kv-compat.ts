/**
 * @vercel/kv → Cloudflare KV compatibility adapter
 *
 * Vercel KV is backed by Upstash Redis. Cloudflare KV has a different API.
 * This adapter wraps Cloudflare KV to expose a Vercel KV-compatible interface
 * for the credit-service and other components.
 */

import type { Kv } from '@vercel/kv'

interface CloudflareKvOptions {
  url?: string
  token?: string
  namespace?: KVNamespace
}

/**
 * Creates a Vercel KV-compatible client backed by either:
 * 1. A Cloudflare KV namespace (Pages/Workers binding) — preferred
 * 2. Upstash Redis REST API (falls back to KV_REST_API_URL env vars)
 */
export function createCloudflareKv(opts?: CloudflareKvOptions): Kv {
  const kvNamespace = opts?.namespace ?? typeof FLUXAI_KV !== 'undefined' ? FLUXAI_KV : undefined

  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      if (kvNamespace) {
        const val = await kvNamespace.get(key)
        return val ? (JSON.parse(val) as T) : null
      }
      return upstashGet<T>(key)
    },

    async set(key: string, value: unknown, opts?: any): Promise<'OK'> {
      const str = typeof value === 'string' ? value : JSON.stringify(value)
      const ttl = opts?.ex ?? opts?.px
      const options = ttl ? { expirationTtl: Math.ceil(ttl / 1000) } : undefined

      if (kvNamespace) {
        await kvNamespace.put(key, str, options)
      } else {
        await upstashSet(key, str, options)
      }
      return 'OK'
    },

    async del(...keys: string[]): Promise<number> {
      if (kvNamespace) {
        let count = 0
        for (const key of keys) {
          await kvNamespace.delete(key)
          count++
        }
        return count
      }
      return upstashDel(keys)
    },

    async eval(script: string, keys: string[], args: string[]): Promise<any> {
      // EVAL is a Redis command. Cloudflare KV doesn't support Lua scripting.
      // Fall back to Upstash Redis REST API with EVAL support.
      return upstashEval(script, keys, args)
    },

    async mget<T = unknown>(...keys: string[]): Promise<(T | null)[]> {
      if (kvNamespace) {
        const results = await Promise.all(keys.map(k => kvNamespace.get(k)))
        return results.map(r => (r ? (JSON.parse(r) as T) : null))
      }
      return upstashMget<T>(keys)
    },

    async mset(keyValuePairs: Record<string, unknown>): Promise<'OK'> {
      for (const [key, value] of Object.entries(keyValuePairs)) {
        await this.set(key, value)
      }
      return 'OK'
    },

    async incr(key: string): Promise<number> {
      if (kvNamespace) {
        const val = (await kvNamespace.get(key)) ?? '0'
        const next = parseInt(val, 10) + 1
        await kvNamespace.put(key, next.toString())
        return next
      }
      return upstashIncr(key)
    },

    async expire(key: string, seconds: number): Promise<number> {
      // Cloudflare KV doesn't support TTL per se, but the put TTL works on set.
      // For existing keys this is a no-op — re-set with TTL.
      if (kvNamespace) {
        const val = await kvNamespace.get(key)
        if (val !== null) {
          await kvNamespace.put(key, val, { expirationTtl: seconds })
          return 1
        }
        return 0
      }
      // Upstash supports EXPIRE
      const url = getUpstashUrl()
      const res = await fetch(url, {
        method: 'POST',
        headers: getUpstashHeaders(),
        body: JSON.stringify(['EXPIRE', key, seconds]),
      })
      const data = await res.json()
      return data.result ?? 0
    },
  }
}

// ─── Upstash REST helpers (fallback when no KV binding) ──────────────────

function getUpstashUrl(): string {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? ''
}

function getUpstashHeaders(): Record<string, string> {
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? ''
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function upstashGet<T>(key: string): Promise<T | null> {
  const url = getUpstashUrl()
  if (!url) return null
  const res = await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(['GET', key]),
  })
  const data = await res.json()
  return data.result !== null && data.result !== undefined ? (data.result as T) : null
}

async function upstashSet(key: string, value: string, opts?: { expirationTtl?: number }): Promise<'OK'> {
  const url = getUpstashUrl()
  if (!url) return 'OK'
  const args = opts?.expirationTtl ? ['SET', key, value, 'EX', String(opts.expirationTtl)] : ['SET', key, value]
  await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(args),
  })
  return 'OK'
}

async function upstashDel(keys: string[]): Promise<number> {
  const url = getUpstashUrl()
  if (!url) return 0
  const res = await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(['DEL', ...keys]),
  })
  const data = await res.json()
  return data.result ?? 0
}

async function upstashEval(script: string, keys: string[], args: string[]): Promise<any> {
  const url = getUpstashUrl()
  if (!url) return null

  // EVAL is supported by Upstash REST API
  const res = await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(['EVAL', script, keys.length.toString(), ...keys, ...args]),
  })
  const data = await res.json()
  return data.result
}

async function upstashMget<T>(keys: string[]): Promise<(T | null)[]> {
  const url = getUpstashUrl()
  if (!url) return keys.map(() => null)
  const res = await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(['MGET', ...keys]),
  })
  const data = await res.json()
  return (data.result ?? []).map((r: any) => (r !== null ? (r as T) : null))
}

async function upstashIncr(key: string): Promise<number> {
  const url = getUpstashUrl()
  if (!url) return 0
  const res = await fetch(url, {
    method: 'POST',
    headers: getUpstashHeaders(),
    body: JSON.stringify(['INCR', key]),
  })
  const data = await res.json()
  return data.result ?? 0
}

// Declare Cloudflare KV namespace binding (injected at runtime)
declare global {
  const FLUXAI_KV: KVNamespace | undefined
}
