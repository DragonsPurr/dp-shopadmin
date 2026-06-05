"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const account_verification_1 = require("./src/emails/account-verification");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
module.exports = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        http: {
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    modules: [
        {
            resolve: "@medusajs/medusa/fulfillment",
            options: {
                providers: [
                    {
                        resolve: "@medusajs/medusa/fulfillment-manual",
                        id: "manual",
                    },
                    {
                        resolve: "./src/modules/shipstation",
                        id: "shipstation",
                        options: {
                            api_key: process.env.SHIPSTATION_API_KEY,
                        },
                    },
                ],
            },
        },
        {
            resolve: "@medusajs/medusa/payment",
            options: {
                providers: [
                    {
                        resolve: "@medusajs/medusa/payment-stripe",
                        id: "stripe",
                        options: {
                            apiKey: process.env.STRIPE_API_KEY,
                            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                        },
                    },
                ],
            },
        },
        {
            resolve: "@medusajs/medusa/notification",
            options: {
                providers: [
                    {
                        resolve: "@webbers/mailgun-notification-medusa/providers/notification-mailgun",
                        id: "notification-mailgun",
                        options: {
                            channels: ["email"],
                            apiKey: process.env.MAILGUN_API_KEY,
                            domain: process.env.MAILGUN_DOMAIN,
                            from_email: process.env.MAILGUN_FROM,
                            api_url: process.env.MAILGUN_API_URL,
                            templates: {
                                "account-verification": {
                                    subject: account_verification_1.accountVerificationSubject,
                                    template: account_verification_1.getAccountVerificationTemplate,
                                },
                            },
                            default_locale: process.env.MAILGUN_DEFAULT_LOCALE || "en",
                        },
                    },
                ],
            },
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFDakUsNEVBRzBDO0FBRTFDLElBQUEsZUFBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUU3RCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixhQUFhLEVBQUU7UUFDYixXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO1FBQ3JDLElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2hDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxhQUFhO1lBQ2xELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxhQUFhO1NBQ3pEO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUDtZQUNFLE9BQU8sRUFBRSw4QkFBOEI7WUFDdkMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUscUNBQXFDO3dCQUM5QyxFQUFFLEVBQUUsUUFBUTtxQkFDYjtvQkFDRDt3QkFDRSxPQUFPLEVBQUUsMkJBQTJCO3dCQUNwQyxFQUFFLEVBQUUsYUFBYTt3QkFDakIsT0FBTyxFQUFFOzRCQUNQLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjt5QkFDMUM7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsMEJBQTBCO1lBQ25DLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLGlDQUFpQzt3QkFDMUMsRUFBRSxFQUFFLFFBQVE7d0JBQ1osT0FBTyxFQUFFOzRCQUNQLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWU7NEJBQ25DLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFzQjt5QkFDbEQ7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsK0JBQStCO1lBQ3hDLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUNMLHFFQUFxRTt3QkFDdkUsRUFBRSxFQUFFLHNCQUFzQjt3QkFDMUIsT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbkIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZTs0QkFDbkMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYzs0QkFDbEMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTs0QkFDcEMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZTs0QkFDcEMsU0FBUyxFQUFFO2dDQUNULHNCQUFzQixFQUFFO29DQUN0QixPQUFPLEVBQUUsaURBQTBCO29DQUNuQyxRQUFRLEVBQUUscURBQThCO2lDQUN6Qzs2QkFDRjs0QkFDRCxjQUFjLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxJQUFJO3lCQUMzRDtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9