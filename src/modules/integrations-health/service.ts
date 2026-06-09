import { GetObjectCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3"
import { MedusaError } from "@medusajs/framework/utils"
import Redis from "ioredis"
import pg from "pg"
import { ShipStationClient } from "../shipstation/client"
import {
  IntegrationHealthResult,
  IntegrationHealthStatus,
  IntegrationId,
  IntegrationsHealthReport,
  IntegrationTestInput,
  IntegrationTestResult,
} from "./types"
import { getAllowedRevealKeys, getSanitizedConfig, revealConfigValue } from "./sanitize-config"

type IntegrationMeta = {
  id: IntegrationId
  name: string
  description: string
  envKeys: string[]
}

const INTEGRATIONS: IntegrationMeta[] = [
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Primary database for Medusa.",
    envKeys: ["DATABASE_URL"],
  },
  {
    id: "redis",
    name: "Redis",
    description: "Cache, events, and workflow engine backing store.",
    envKeys: ["REDIS_URL"],
  },
  {
    id: "s3",
    name: "Object Storage (S3)",
    description: "Product image storage via OVH Object Storage.",
    envKeys: [
      "S3_ACCESS_KEY_ID",
      "S3_SECRET_ACCESS_KEY",
      "S3_BUCKET",
      "S3_REGION",
    ],
  },
  {
    id: "shipstation",
    name: "ShipStation",
    description: "Fulfillment rates and shipping label generation.",
    envKeys: ["SHIPSTATION_API_KEY"],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing and checkout.",
    envKeys: ["STRIPE_API_KEY"],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Email delivery and tracking.",
    envKeys: ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "MAILGUN_FROM", "MAILGUN_API_URL"],
  },
]

class IntegrationsHealthService {
  async getHealthReport(): Promise<IntegrationsHealthReport> {
    const integrations = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkS3(),
      this.checkShipStation(),
      this.checkStripe(),
      this.checkMailgun(),
    ])

    return {
      checked_at: new Date().toISOString(),
      integrations,
    }
  }

  async runIntegrationTest(
    id: IntegrationId,
    input: IntegrationTestInput = {}
  ): Promise<IntegrationTestResult> {
    switch (id) {
      case "postgres":
        return this.testPostgres()
      case "redis":
        return this.testRedis()
      case "s3":
        return this.testS3Object(input.object_key)
      case "mailgun":
        return this.testMailgunEmail(input.to)
      case "shipstation":
        return this.testShipStation()
      case "stripe":
        return this.testStripe()
      default:
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unknown integration: ${id}`
        )
    }
  }

  revealConfig(id: IntegrationId, revealKey: string): { value: string } {
    this.getMeta(id)

    const allowedKeys = getAllowedRevealKeys(id)

    if (!allowedKeys.has(revealKey)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Reveal is not allowed for this configuration field.`
      )
    }

    return { value: revealConfigValue(revealKey) }
  }

  private getMeta(id: IntegrationId): IntegrationMeta {
    const meta = INTEGRATIONS.find((integration) => integration.id === id)

    if (!meta) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown integration: ${id}`
      )
    }

    return meta
  }

  private misconfiguredTest(
    id: IntegrationId,
    missing: string[]
  ): IntegrationTestResult {
    return {
      id,
      success: false,
      message: `Missing environment variables: ${missing.join(", ")}`,
      details: null,
    }
  }

  private createS3Client(): S3Client {
    return new S3Client({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      ...(process.env.S3_FORCE_PATH_STYLE === "true"
        ? { forcePathStyle: true }
        : {}),
    })
  }

  private getMailgunAuthHeader(): string {
    return `Basic ${Buffer.from(
      `api:${process.env.MAILGUN_API_KEY}`
    ).toString("base64")}`
  }

  private async withPostgresClient<T>(
    fn: (client: pg.Client) => Promise<T>
  ): Promise<T> {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()

    try {
      return await fn(client)
    } finally {
      await client.end()
    }
  }

  private createRedisClient(): Redis {
    return new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    })
  }

  private async withRedisClient<T>(
    fn: (client: Redis) => Promise<T>
  ): Promise<T> {
    const client = this.createRedisClient()

    await client.connect()

    try {
      return await fn(client)
    } finally {
      await client.quit()
    }
  }

  private async checkPostgres(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("postgres")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      await this.withPostgresClient(async (client) => {
        await client.query("SELECT 1")
      })

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private async checkRedis(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("redis")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      await this.withRedisClient(async (client) => {
        const response = await client.ping()

        if (response !== "PONG") {
          throw new Error(`Unexpected Redis response: ${response}`)
        }
      })

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private async testPostgres(): Promise<IntegrationTestResult> {
    const meta = this.getMeta("postgres")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("postgres", missing)
    }

    try {
      const result = await this.withPostgresClient(async (client) => {
        const { rows } = await client.query<{
          version: string
          database: string
          user: string
        }>(
          "SELECT version(), current_database() AS database, current_user AS user"
        )

        return rows[0]
      })

      return {
        id: "postgres",
        success: true,
        message: `Connected to database "${result.database}" as ${result.user}.`,
        details: {
          database: result.database,
          user: result.user,
          version: result.version,
        },
      }
    } catch (error) {
      return {
        id: "postgres",
        success: false,
        message: this.formatError(error),
        details: null,
      }
    }
  }

  private async testRedis(): Promise<IntegrationTestResult> {
    const meta = this.getMeta("redis")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("redis", missing)
    }

    const testKey = `medusa:integration-test:${Date.now()}`

    try {
      const details = await this.withRedisClient(async (client) => {
        await client.set(testKey, "ok", "EX", 60)
        const value = await client.get(testKey)
        await client.del(testKey)

        if (value !== "ok") {
          throw new Error("Redis read/write verification failed.")
        }

        return {
          ping: await client.ping(),
          read_write_verified: true,
        }
      })

      return {
        id: "redis",
        success: true,
        message: "Redis ping succeeded and read/write verification passed.",
        details,
      }
    } catch (error) {
      return {
        id: "redis",
        success: false,
        message: this.formatError(error),
        details: null,
      }
    }
  }

  private async testS3Object(
    objectKey?: string
  ): Promise<IntegrationTestResult> {
    const meta = this.getMeta("s3")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("s3", missing)
    }

    const key = objectKey?.trim()

    if (!key) {
      return {
        id: "s3",
        success: false,
        message: "Object key is required.",
        details: null,
      }
    }

    try {
      const client = this.createS3Client()
      const response = await client.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET!,
          Key: key,
        })
      )

      const contentLength = response.ContentLength ?? 0
      const contentType = response.ContentType ?? "unknown"

      return {
        id: "s3",
        success: true,
        message: `Fetched object "${key}" (${contentLength} bytes).`,
        details: {
          object_key: key,
          content_length: contentLength,
          content_type: contentType,
          etag: response.ETag ?? null,
          last_modified: response.LastModified?.toISOString() ?? null,
          public_url: process.env.S3_FILE_URL
            ? `${process.env.S3_FILE_URL.replace(/\/$/, "")}/${key
                .split("/")
                .map(encodeURIComponent)
                .join("/")}`
            : null,
        },
      }
    } catch (error) {
      return {
        id: "s3",
        success: false,
        message: this.formatError(error),
        details: { object_key: key },
      }
    }
  }

  private async testMailgunEmail(to?: string): Promise<IntegrationTestResult> {
    const meta = this.getMeta("mailgun")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("mailgun", missing)
    }

    const recipient = to?.trim()

    if (!recipient) {
      return {
        id: "mailgun",
        success: false,
        message: "Recipient email address is required.",
        details: null,
      }
    }

    try {
      const apiUrl = process.env.MAILGUN_API_URL!.replace(/\/$/, "")
      const domain = process.env.MAILGUN_DOMAIN!
      const body = new URLSearchParams({
        from: process.env.MAILGUN_FROM!,
        to: recipient,
        subject: "Dragon's Purr shop admin integration test",
        text: "This is a manual test email sent from the Medusa admin Integrations page.",
      })

      const response = await fetch(`${apiUrl}/v3/${domain}/messages`, {
        method: "POST",
        headers: {
          Authorization: this.getMailgunAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      })

      const payload = (await response.json().catch(() => null)) as {
        id?: string
        message?: string
      } | null

      if (!response.ok) {
        return {
          id: "mailgun",
          success: false,
          message: payload?.message ?? `Mailgun API returned ${response.status}`,
          details: { to: recipient },
        }
      }

      return {
        id: "mailgun",
        success: true,
        message: `Test email queued for ${recipient}.`,
        details: {
          to: recipient,
          message_id: payload?.id ?? null,
        },
      }
    } catch (error) {
      return {
        id: "mailgun",
        success: false,
        message: this.formatError(error),
        details: { to: recipient },
      }
    }
  }

  private async testShipStation(): Promise<IntegrationTestResult> {
    const meta = this.getMeta("shipstation")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("shipstation", missing)
    }

    try {
      const client = new ShipStationClient({
        api_key: process.env.SHIPSTATION_API_KEY!,
      })
      const { carriers } = await client.getCarriers()
      const activeCarriers = carriers.filter(
        (carrier) => !carrier.disabled_by_billing_plan
      )

      return {
        id: "shipstation",
        success: true,
        message: `Retrieved ${activeCarriers.length} active carrier(s).`,
        details: {
          carrier_count: activeCarriers.length,
          carriers: activeCarriers.map((carrier) => ({
            name: carrier.friendly_name,
            carrier_id: carrier.carrier_id,
            services: carrier.services.length,
          })),
        },
      }
    } catch (error) {
      return {
        id: "shipstation",
        success: false,
        message: this.formatError(error),
        details: null,
      }
    }
  }

  private async testStripe(): Promise<IntegrationTestResult> {
    const meta = this.getMeta("stripe")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.misconfiguredTest("stripe", missing)
    }

    try {
      const response = await fetch("https://api.stripe.com/v1/account", {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_API_KEY}`,
        },
      })

      const account = (await response.json().catch(() => null)) as {
        id?: string
        email?: string
        business_profile?: { name?: string }
        livemode?: boolean
        error?: { message?: string }
      } | null

      if (!response.ok) {
        return {
          id: "stripe",
          success: false,
          message:
            account?.error?.message ?? `Stripe API returned ${response.status}`,
          details: null,
        }
      }

      return {
        id: "stripe",
        success: true,
        message: `Connected to Stripe account ${account?.id ?? "unknown"}.`,
        details: {
          account_id: account?.id ?? null,
          email: account?.email ?? null,
          business_name: account?.business_profile?.name ?? null,
          livemode: account?.livemode ?? null,
        },
      }
    } catch (error) {
      return {
        id: "stripe",
        success: false,
        message: this.formatError(error),
        details: null,
      }
    }
  }

  private getMissingEnvKeys(keys: string[]): string[] {
    return keys.filter((key) => !process.env[key]?.trim())
  }

  private buildResult(
    meta: IntegrationMeta,
    status: IntegrationHealthStatus,
    configured: boolean,
    accessible: boolean,
    message: string | null
  ): IntegrationHealthResult {
    return {
      id: meta.id,
      name: meta.name,
      description: meta.description,
      status,
      configured,
      accessible,
      message,
      config: getSanitizedConfig(meta.id),
    }
  }

  private async checkS3(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("s3")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      const client = this.createS3Client()

      await client.send(
        new HeadBucketCommand({ Bucket: process.env.S3_BUCKET! })
      )

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private async checkShipStation(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("shipstation")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      const client = new ShipStationClient({
        api_key: process.env.SHIPSTATION_API_KEY!,
      })
      await client.getCarriers()

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private async checkStripe(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("stripe")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      const response = await fetch("https://api.stripe.com/v1/balance", {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_API_KEY}`,
        },
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string }
        } | null

        return this.buildResult(
          meta,
          "unreachable",
          true,
          false,
          body?.error?.message ?? `Stripe API returned ${response.status}`
        )
      }

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private async checkMailgun(): Promise<IntegrationHealthResult> {
    const meta = this.getMeta("mailgun")
    const missing = this.getMissingEnvKeys(meta.envKeys)

    if (missing.length > 0) {
      return this.buildResult(
        meta,
        "misconfigured",
        false,
        false,
        `Missing environment variables: ${missing.join(", ")}`
      )
    }

    try {
      const apiUrl = process.env.MAILGUN_API_URL!.replace(/\/$/, "")
      const domain = process.env.MAILGUN_DOMAIN!
      const response = await fetch(
        `${apiUrl}/v3/domains/${encodeURIComponent(domain)}`,
        {
          headers: {
            Authorization: this.getMailgunAuthHeader(),
          },
        }
      )

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string
        } | null

        return this.buildResult(
          meta,
          "unreachable",
          true,
          false,
          body?.message ?? `Mailgun API returned ${response.status}`
        )
      }

      return this.buildResult(meta, "healthy", true, true, null)
    } catch (error) {
      return this.buildResult(
        meta,
        "unreachable",
        true,
        false,
        this.formatError(error)
      )
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    return "Unknown error while checking integration"
  }
}

export default IntegrationsHealthService
