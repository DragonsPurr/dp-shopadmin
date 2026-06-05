"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("@medusajs/framework/http");
const customer_email_verification_1 = require("./middlewares/customer-email-verification");
exports.default = (0, http_1.defineMiddlewares)({
    routes: [
        {
            matcher: "/auth/customer/emailpass",
            method: ["POST"],
            middlewares: [customer_email_verification_1.customerEmailVerificationLogin],
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpL21pZGRsZXdhcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQTREO0FBQzVELDJGQUEwRjtBQUUxRixrQkFBZSxJQUFBLHdCQUFpQixFQUFDO0lBQy9CLE1BQU0sRUFBRTtRQUNOO1lBQ0UsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDaEIsV0FBVyxFQUFFLENBQUMsNERBQThCLENBQUM7U0FDOUM7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9