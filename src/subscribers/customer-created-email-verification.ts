import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendAccountVerificationEmail } from "../lib/email-verification"

export default async function customerCreatedEmailVerificationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "has_account"],
    filters: { id: data.id },
  })

  const customer = customers?.[0]

  if (!customer?.email || !customer.has_account) {
    return
  }

  await sendAccountVerificationEmail(container, {
    email: customer.email,
    firstName: customer.first_name,
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
