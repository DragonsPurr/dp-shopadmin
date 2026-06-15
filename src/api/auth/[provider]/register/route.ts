import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { refetchUser } from "@medusajs/medusa/api/admin/users/helpers"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { registerGoogleUserWorkflow } from "../../../../workflows/register-google-user"

const SUPPORTED_PROVIDERS = ["google"] as const

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { provider } = req.params

  if (!SUPPORTED_PROVIDERS.includes(provider as (typeof SUPPORTED_PROVIDERS)[number])) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Provider "${provider}" is not supported for admin registration.`
    )
  }

  if (req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a user."
    )
  }

  const authId = req.auth_context.auth_identity_id

  if (!authId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User is missing an auth identity."
    )
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const providerIdentities = await authModuleService.listProviderIdentities({
    auth_identity_id: authId,
    provider,
  })

  if (providerIdentities.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "User is missing a provider identity."
    )
  }

  const providerIdentity = providerIdentities[0]

  if (!providerIdentity.user_metadata?.email) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Google account is missing a verified email address."
    )
  }

  const workspaceDomain =
    process.env.GOOGLE_WORKSPACE_DOMAIN?.trim().toLowerCase() || "dragonspurr.ca"

  const { user_metadata } = providerIdentity

  const { result } = await registerGoogleUserWorkflow(req.scope).run({
    input: {
      email: String(user_metadata.email),
      first_name: (user_metadata.given_name ||
        user_metadata.first_name) as string | null,
      last_name: (user_metadata.family_name ||
        user_metadata.last_name) as string | null,
      workspaceDomain,
      authIdentityId: authId,
    },
  })

  const user = await refetchUser(result.id, req.scope, req.queryConfig.fields)

  res.status(200).json({ user })
}
