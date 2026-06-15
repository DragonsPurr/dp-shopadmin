import { UserDTO } from "@medusajs/framework/types"
import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import {
  linkOrCreateGoogleUserStep,
  LinkOrCreateGoogleUserInput,
} from "./steps/link-or-create-google-user"

type RegisterGoogleUserWorkflowInput = LinkOrCreateGoogleUserInput & {
  authIdentityId: string
}

export const registerGoogleUserWorkflow = createWorkflow(
  "register-google-user",
  (
    input: WorkflowData<RegisterGoogleUserWorkflowInput>
  ): WorkflowResponse<UserDTO> => {
    const user = linkOrCreateGoogleUserStep(input)

    setAuthAppMetadataStep({
      authIdentityId: input.authIdentityId,
      actorType: "user",
      value: transform(user, (existingUser) => existingUser.id),
    })

    return new WorkflowResponse(user)
  }
)
