const DEFAULT_SITE_URL = "https://app.saverifiednews.co.za"

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL

export const SITE_URL = configuredSiteUrl.endsWith("/")
  ? configuredSiteUrl.slice(0, -1)
  : configuredSiteUrl

export const SITE_NAME = "Screensplit"
export const SITE_TITLE = "Screensplit - Before and After Photo Combiner"
export const SITE_DESCRIPTION =
  "Create polished before and after visuals in minutes. Upload, align, style, and export high-quality comparisons for social, clients, and campaigns."
export const SITE_LOCALE = "en_ZA"

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, `${SITE_URL}/`).toString()
}

