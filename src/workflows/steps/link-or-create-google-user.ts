import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  FeatureFlag,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import rbac from "@medusajs/medusa/feature-flags/rbac"

export type LinkOrCreateGoogleUserInput = {
  email: string
  first_name?: string | null
  last_name?: string | null
  workspaceDomain: string
}

export const linkOrCreateGoogleUserStep = createStep(
  "link-or-create-google-user",
  async (input: LinkOrCreateGoogleUserInput, { container }) => {
    const email = input.email.trim().toLowerCase()
    const domain = input.workspaceDomain.trim().toLowerCase()
    const emailDomain = email.split("@")[1]

    if (!emailDomain || emailDomain !== domain) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Only @${domain} Google Workspace accounts can sign in.`
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const workflowEngine = container.resolve(Modules.WORKFLOW_ENGINE)

    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { email },
    })

    if (users[0]) {
      return new StepResponse(users[0])
    }

    let userRoles: string[] = []

    if (FeatureFlag.isFeatureEnabled(rbac.key)) {
      const rbacService = container.resolve(Modules.RBAC)
      const superAdminRoles = await rbacService.listRbacRoles({
        id: "role_super_admin",
      })

      if (superAdminRoles.length > 0) {
        userRoles = [superAdminRoles[0].id]
      }
    }

    const { result: createdUsers } = await workflowEngine.run(
      "create-users-workflow",
      {
        input: {
          users: [
            {
              email,
              first_name: input.first_name ?? undefined,
              last_name: input.last_name ?? undefined,
              roles: userRoles,
            },
          ],
        },
      }
    )

    return new StepResponse(createdUsers[0])
  }
)
