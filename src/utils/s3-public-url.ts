function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "")
}

export function getS3PublicBaseUrl(): string {
  const bucket = process.env.S3_BUCKET ?? ""
  const region = process.env.S3_REGION ?? ""
  const configured = trimTrailingSlash(process.env.S3_FILE_URL ?? "")

  if (!bucket || !region) {
    return configured
  }

  const pathStyleBase = `https://s3.${region}.io.cloud.ovh.net/${bucket}`
  const virtualHostedBase = `https://${bucket}.s3.${region}.io.cloud.ovh.net`

  if (
    configured === pathStyleBase ||
    configured.startsWith(`${pathStyleBase}/`)
  ) {
    return virtualHostedBase
  }

  return configured || virtualHostedBase
}

export function buildS3PublicObjectUrl(objectKey: string): string {
  const encodedKey = objectKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")

  return `${getS3PublicBaseUrl()}/${encodedKey}`
}

const DEFAULT_ADMIN_FAVICON_KEY = "favicon.ico"

export function getAdminFaviconKey(): string {
  const key = process.env.ADMIN_FAVICON_KEY?.trim()
  return key || DEFAULT_ADMIN_FAVICON_KEY
}

export function getAdminFaviconUrl(): string {
  return buildS3PublicObjectUrl(getAdminFaviconKey())
}

export function getAdminFaviconMimeType(key = getAdminFaviconKey()): string {
  const lower = key.toLowerCase()

  if (lower.endsWith(".svg")) {
    return "image/svg+xml"
  }

  if (lower.endsWith(".png")) {
    return "image/png"
  }

  return "image/x-icon"
}

export function rewriteS3PublicUrl(url: string): string {
  const bucket = process.env.S3_BUCKET ?? ""
  const region = process.env.S3_REGION ?? ""

  if (!bucket || !region) {
    return url
  }

  const from = `https://s3.${region}.io.cloud.ovh.net/${bucket}/`
  const to = `https://${bucket}.s3.${region}.io.cloud.ovh.net/`

  return url.startsWith(from) ? url.replace(from, to) : url
}
