import type { Thing, WithContext } from "schema-dts"

export function serializeJsonLd<T extends Thing>(payload: WithContext<T>): string {
  return JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

