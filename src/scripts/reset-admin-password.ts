import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import * as readline from "readline/promises"
import { stdin as input, stdout as output } from "process"

const PROVIDER = "emailpass"

async function prompt(label: string): Promise<string> {
  const rl = readline.createInterface({ input, output })
  try {
    return (await rl.question(label)).trim()
  } finally {
    rl.close()
  }
}

export default async function resetAdminPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const authService = container.resolve(Modules.AUTH)
  const userService = container.resolve(Modules.USER)

  const email =
    process.env.ADMIN_EMAIL?.trim() || (await prompt("Email: "))
  const password =
    process.env.ADMIN_PASSWORD?.trim() ||
    (await prompt("New password: "))

  if (!email || !password) {
    throw new Error("Email and new password are required.")
  }

  const [user] = await userService.listUsers({ email })

  if (!user) {
    throw new Error(`No admin user found with email: ${email}`)
  }

  const [providerIdentity] = await authService.listProviderIdentities(
    { entity_id: email, provider: PROVIDER },
    { select: ["id", "auth_identity_id"] }
  )

  if (!providerIdentity) {
    throw new Error(
      `No ${PROVIDER} credentials found for ${email}. Create the user first with npm run createUser.`
    )
  }

  const authIdentityId = providerIdentity.auth_identity_id

  if (!authIdentityId) {
    throw new Error(`Credentials for ${email} are not linked to an auth identity.`)
  }

  const [authIdentity] = await authService.listAuthIdentities(
    { id: [authIdentityId] },
    { select: ["id", "app_metadata"] }
  )

  const linkedUserId = authIdentity?.app_metadata?.user_id as
    | string
    | undefined

  if (!linkedUserId || linkedUserId !== user.id) {
    throw new Error(
      `Credentials for ${email} are not linked to an admin user.`
    )
  }

  const { success, error } = await authService.updateProvider(PROVIDER, {
    entity_id: email,
    password,
  })

  if (!success) {
    throw new Error(
      typeof error === "string" ? error : "Failed to reset admin password."
    )
  }

  logger.info(`Admin password reset successfully for: ${email}`)
}
