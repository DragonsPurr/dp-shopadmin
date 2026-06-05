import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getAuthContextFromJwtToken } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { markEmailVerified } from "../../../../lib/email-verification"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE) as {
    projectConfig: {
      http: {
        jwtSecret: string
        jwtPublicKey?: string
        jwtVerifyOptions?: Record<string, unknown>
        jwtOptions?: Record<string, unknown>
      }
    }
  }
  const { http } = config.projectConfig

  const token = getAuthContextFromJwtToken(
    req.headers.authorization,
    http.jwtSecret,
    ["bearer"],
    ["customer"],
    http.jwtPublicKey,
    http.jwtVerifyOptions ?? http.jwtOptions
  )

  if (!token) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Invalid or expired verification token"
    )
  }

  const email =
    (token as { entity_id?: string }).entity_id ?? token.actor_id

  if (!email) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Invalid or expired verification token"
    )
  }

  await markEmailVerified(req.scope, email)

  res.json({ success: true })
}
