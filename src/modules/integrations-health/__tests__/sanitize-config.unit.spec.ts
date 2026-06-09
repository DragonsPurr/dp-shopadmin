import {
  getAllowedRevealKeys,
  getSanitizedConfig,
  revealConfigValue,
} from "../sanitize-config"

describe("integrations-health sanitize-config", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("masks secret env values and marks them revealable", () => {
    process.env.S3_SECRET_ACCESS_KEY = "supersecretkey"

    const config = getSanitizedConfig("s3")
    const secret = config.find((entry) => entry.label === "Secret access key")

    expect(secret?.value).toBe("***tkey")
    expect(secret?.sensitive).toBe(true)
    expect(secret?.reveal_key).toBe("S3_SECRET_ACCESS_KEY")
  })

  it("shows non-secret env values as-is", () => {
    process.env.S3_BUCKET = "product-images"

    const config = getSanitizedConfig("s3")
    const bucket = config.find((entry) => entry.label === "Bucket")

    expect(bucket?.value).toBe("product-images")
    expect(bucket?.sensitive).toBeFalsy()
  })

  it("reveals env-backed secrets", () => {
    process.env.SHIPSTATION_API_KEY = "shipstation-test-key"

    expect(revealConfigValue("SHIPSTATION_API_KEY")).toBe(
      "shipstation-test-key"
    )
  })

  it("reveals passwords parsed from connection URLs", () => {
    process.env.DATABASE_URL =
      "postgres://dbuser:secretpass@db.example.com:5432/shop"

    const config = getSanitizedConfig("postgres")
    const password = config.find((entry) => entry.label === "Password")

    expect(password?.value).toBe("***")
    expect(password?.reveal_key).toBe("DATABASE_URL#password")
    expect(revealConfigValue("DATABASE_URL#password")).toBe("secretpass")
  })

  it("limits reveal keys to configured sensitive fields", () => {
    process.env.STRIPE_API_KEY = "sk_test_example"

    const allowed = getAllowedRevealKeys("stripe")

    expect(allowed.has("STRIPE_API_KEY")).toBe(true)
    expect(allowed.has("SHIPSTATION_API_KEY")).toBe(false)
  })
})
