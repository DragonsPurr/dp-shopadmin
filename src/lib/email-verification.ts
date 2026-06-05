import {
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils"

const CUSTOMER_ACTOR = "customer"
const EMAILPASS_PROVIDER = "emailpass"
const VERIFICATION_TOKEN_EXPIRY = "24h"

export function getStorefrontUrl(): string {
  return (
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:8000"
  )
}

export function buildVerificationUrl(token: string, countryCode = "us"): string {
  const base = getStorefrontUrl().replace(/\/$/, "")
  return `${base}/${countryCode}/account/verify?token=${encodeURIComponent(token)}`
}

export function generateEmailVerificationToken(
  email: string,
  jwtSecret: string,
  jwtOptions?: Record<string, unknown>
): string {
  return generateJwtToken(
    {
      entity_id: email,
      provider: EMAILPASS_PROVIDER,
      actor_type: CUSTOMER_ACTOR,
    },
    {
      secret: jwtSecret,
      expiresIn: VERIFICATION_TOKEN_EXPIRY,
      jwtOptions,
    }
  )
}

export async function markEmailUnverified(
  container: { resolve: (key: string) => unknown },
  email: string
): Promise<void> {
  const authModule = container.resolve(Modules.AUTH) as {
    listProviderIdentities: (
      filters: { entity_id: string; provider: string },
      config?: { select?: string[] }
    ) => Promise<{ id: string; provider_metadata?: Record<string, unknown> }[]>
    updateProviderIdentities: (
      data: { id: string; provider_metadata: Record<string, unknown> }
    ) => Promise<unknown>
  }

  const [providerIdentity] = await authModule.listProviderIdentities(
    { entity_id: email, provider: EMAILPASS_PROVIDER },
    { select: ["id", "provider_metadata"] }
  )

  if (!providerIdentity) {
    return
  }

  await authModule.updateProviderIdentities({
    id: providerIdentity.id,
    provider_metadata: {
      ...(providerIdentity.provider_metadata ?? {}),
      email_verified: false,
    },
  })
}

export async function markEmailVerified(
  container: { resolve: (key: string) => unknown },
  email: string
): Promise<void> {
  const authModule = container.resolve(Modules.AUTH) as {
    listProviderIdentities: (
      filters: { entity_id: string; provider: string },
      config?: { select?: string[] }
    ) => Promise<{ id: string; provider_metadata?: Record<string, unknown> }[]>
    updateProviderIdentities: (
      data: { id: string; provider_metadata: Record<string, unknown> }
    ) => Promise<unknown>
  }

  const [providerIdentity] = await authModule.listProviderIdentities(
    { entity_id: email, provider: EMAILPASS_PROVIDER },
    { select: ["id", "provider_metadata"] }
  )

  if (!providerIdentity) {
    return
  }

  await authModule.updateProviderIdentities({
    id: providerIdentity.id,
    provider_metadata: {
      ...(providerIdentity.provider_metadata ?? {}),
      email_verified: true,
    },
  })
}

export async function sendAccountVerificationEmail(
  container: { resolve: (key: string) => unknown },
  input: {
    email: string
    firstName?: string | null
    countryCode?: string
  }
): Promise<void> {
  const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE) as {
    projectConfig: {
      http: {
        jwtSecret: string
        jwtOptions?: Record<string, unknown>
      }
    }
  }
  const notificationModule = container.resolve(Modules.NOTIFICATION) as {
    createNotifications: (
      data: {
        to: string
        channel: string
        template: string
        data: Record<string, unknown>
      }[]
    ) => Promise<unknown>
  }

  const { http } = config.projectConfig
  const token = generateEmailVerificationToken(
    input.email,
    http.jwtSecret,
    http.jwtOptions
  )

  await markEmailUnverified(container, input.email)

  const locale = process.env.MAILGUN_DEFAULT_LOCALE || "en"
  const countryCode = input.countryCode || "us"

  await notificationModule.createNotifications([
    {
      to: input.email,
      channel: "email",
      template: "account-verification",
      data: {
        locale,
        first_name: input.firstName ?? undefined,
        verification_url: buildVerificationUrl(token, countryCode),
      },
    },
  ])
}
