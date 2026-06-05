import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { sendAccountVerificationEmail } from "../../../../lib/email-verification"

type ResendVerificationBody = {
  email: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email } = req.body as ResendVerificationBody

  if (!email || typeof email !== "string") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A valid email is required"
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const authModule = req.scope.resolve(Modules.AUTH) as {
    listProviderIdentities: (
      filters: { entity_id: string; provider: string },
      config?: { select?: string[] }
    ) => Promise<
      { provider_metadata?: { email_verified?: boolean } }[]
    >
  }

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "has_account"],
    filters: { email },
  })

  const customer = customers?.[0]

  if (!customer?.has_account) {
    return res.status(201).json({ success: true })
  }

  const [providerIdentity] = await authModule.listProviderIdentities(
    { entity_id: email, provider: "emailpass" },
    { select: ["provider_metadata"] }
  )

  if (providerIdentity?.provider_metadata?.email_verified === true) {
    return res.status(201).json({ success: true })
  }

  await sendAccountVerificationEmail(req.scope, {
    email: customer.email as string,
    firstName: customer.first_name,
  })

  res.status(201).json({ success: true })
}
