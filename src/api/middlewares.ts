import { defineMiddlewares } from "@medusajs/framework/http"
import { customerEmailVerificationLogin } from "./middlewares/customer-email-verification"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/customer/emailpass",
      method: ["POST"],
      middlewares: [customerEmailVerificationLogin],
    },
  ],
})
