import {
  buildS3PublicObjectUrl,
  getAdminFaviconMimeType,
  getAdminFaviconUrl,
  getS3PublicBaseUrl,
  rewriteS3PublicUrl,
} from "../s3-public-url"

describe("s3-public-url", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      S3_BUCKET: "dp-shop-assets",
      S3_REGION: "ca-east-tor",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("rewrites OVH path-style public base URLs to virtual-hosted style", () => {
    process.env.S3_FILE_URL =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets"

    expect(getS3PublicBaseUrl()).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net"
    )
  })

  it("builds object URLs from the normalized public base", () => {
    process.env.S3_FILE_URL =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets"

    expect(buildS3PublicObjectUrl("products/test image.png")).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net/products/test%20image.png"
    )
  })

  it("builds admin favicon URL from bucket root", () => {
    process.env.S3_FILE_URL =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets"

    expect(getAdminFaviconUrl()).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net/favicon.ico"
    )
    expect(getAdminFaviconMimeType()).toBe("image/x-icon")
  })

  it("supports custom admin favicon keys and mime types", () => {
    process.env.S3_FILE_URL =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets"
    process.env.ADMIN_FAVICON_KEY = "favicon.svg"

    expect(getAdminFaviconUrl()).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net/favicon.svg"
    )
    expect(getAdminFaviconMimeType()).toBe("image/svg+xml")
  })

  it("rewrites stored image URLs", () => {
    const original =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets/products/foo.png"

    expect(rewriteS3PublicUrl(original)).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net/products/foo.png"
    )
  })
})
