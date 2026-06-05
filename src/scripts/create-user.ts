import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  FeatureFlag,
  Modules,
} from "@medusajs/framework/utils"
import * as readline from "readline/promises"
import { stdin as input, stdout as output } from "process"

async function prompt(label: string): Promise<string> {
  const rl = readline.createInterface({ input, output })
  try {
    return (await rl.question(label)).trim()
  } finally {
    rl.close()
  }
}

export default async function createUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const authService = container.resolve(Modules.AUTH)
  const workflowService = container.resolve(Modules.WORKFLOW_ENGINE)

  const email =
    process.env.ADMIN_EMAIL?.trim() || (await prompt("Email: "))
  const password =
    process.env.ADMIN_PASSWORD?.trim() || (await prompt("Password: "))

  if (!email || !password) {
    throw new Error("Email and password are required.")
  }

  const provider = "emailpass"
  let userRoles: string[] = []

  if (FeatureFlag.isFeatureEnabled("rbac")) {
    const rbacService = container.resolve(Modules.RBAC)
    const superAdminRoles = await rbacService.listRbacRoles({
      id: "role_super_admin",
    })

    if (superAdminRoles.length > 0) {
      userRoles = [superAdminRoles[0].id]
      logger.info("Assigning super admin role to user.")
    }
  }

  const { result: users } = await workflowService.run("create-users-workflow", {
    input: {
      users: [
        {
          email,
          roles: userRoles,
        },
      ],
    },
  })

  const user = users[0]
  const { authIdentity, error } = await authService.register(provider, {
    body: {
      email,
      password,
    },
  })

  if (error || !authIdentity) {
    throw new Error(
      typeof error === "string" ? error : "Failed to register user credentials."
    )
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: {
      user_id: user.id,
    },
  })

  logger.info(
    `User created successfully: ${email}` +
      (userRoles.length > 0 ? " (super admin role assigned)" : "")
  )
}
