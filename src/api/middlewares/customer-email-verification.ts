import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

/**
 * Intercepts customer email/password login and blocks unverified accounts.
 * Handles the response directly so the default auth route is not invoked.
 */
export async function customerEmailVerificationLogin(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const { actor_type, auth_provider } = req.params as {
    actor_type?: string
    auth_provider?: string
  }

  if (
    req.method !== "POST" ||
    actor_type !== "customer" ||
    auth_provider !== "emailpass"
  ) {
    return next()
  }

  const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE) as {
    projectConfig: {
      http: {
        jwtSecret: string
        jwtExpiresIn?: string
        jwtOptions?: Record<string, unknown>
      }
    }
  }
  const authService = req.scope.resolve(Modules.AUTH) as {
    authenticate: (
      provider: string,
      authData: Record<string, unknown>
    ) => Promise<{
      success: boolean
      error?: string
      authIdentity?: {
        id: string
        app_metadata?: Record<string, unknown>
        provider_identities?: {
          provider: string
          provider_metadata?: Record<string, unknown>
          user_metadata?: Record<string, unknown>
        }[]
      }
      location?: string
      mfa_challenge?: unknown
    }>
  }

  const authData = {
    actor_type,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    protocol: req.protocol,
  }

  const { success, error, authIdentity, location, mfa_challenge } =
    await authService.authenticate(auth_provider, authData)

  if (location) {
    return res.status(200).json({ location })
  }

  if (success && mfa_challenge) {
    return res.status(200).json({
      mfa_required: true,
      mfa_challenge,
    })
  }

  if (!success || !authIdentity) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      error || "Authentication failed"
    )
  }

  const providerIdentity = authIdentity.provider_identities?.find(
    (identity) => identity.provider === auth_provider
  )

  if (providerIdentity?.provider_metadata?.email_verified === false) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Please verify your email address before signing in."
    )
  }

  const { http } = config.projectConfig
  const entityIdKey = `${actor_type}_id`
  const entityId = authIdentity.app_metadata?.[entityIdKey]

  const token = generateJwtToken(
    {
      actor_id: (entityId as string) ?? "",
      actor_type,
      auth_identity_id: authIdentity.id,
      auth_provider,
      app_metadata: {
        ...(authIdentity.app_metadata ?? {}),
        [entityIdKey]: entityId,
      },
      user_metadata: providerIdentity?.user_metadata ?? {},
    },
    {
      secret: http.jwtSecret,
      expiresIn: http.jwtExpiresIn,
      jwtOptions: http.jwtOptions,
    }
  )

  return res.status(200).json({ token })
}
