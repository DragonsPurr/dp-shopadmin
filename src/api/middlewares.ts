import {
  authenticate,
  defineMiddlewares,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { AdminGetUsersParams } from "@medusajs/medusa/api/admin/users/validators"
import { customerEmailVerificationLogin } from "./middlewares/customer-email-verification"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/customer/emailpass",
      method: ["POST"],
      middlewares: [customerEmailVerificationLogin],
    },
    {
      matcher: "/auth/:provider/register",
      middlewares: [
        authenticate("user", ["api-key", "bearer", "session"], {
          allowUnregistered: true,
        }),
        validateAndTransformQuery(AdminGetUsersParams, {
          defaults: ["id", "email", "first_name", "last_name"],
          allowed: ["id", "email", "first_name", "last_name"],
          isList: false,
        }),
      ],
    },
  ],
})
