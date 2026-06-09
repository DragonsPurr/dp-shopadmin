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
