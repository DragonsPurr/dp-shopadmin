import {
  buildS3PublicObjectUrl,
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

  it("rewrites stored image URLs", () => {
    const original =
      "https://s3.ca-east-tor.io.cloud.ovh.net/dp-shop-assets/products/foo.png"

    expect(rewriteS3PublicUrl(original)).toBe(
      "https://dp-shop-assets.s3.ca-east-tor.io.cloud.ovh.net/products/foo.png"
    )
  })
})
