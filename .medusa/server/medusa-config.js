"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const account_verification_1 = require("./src/emails/account-verification");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
module.exports = (0, utils_1.defineConfig)({
    projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        redisUrl: process.env.REDIS_URL,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUU7QUFDakUsNEVBRzBDO0FBRTFDLElBQUEsZUFBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUU3RCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixhQUFhLEVBQUU7UUFDYixXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZO1FBQ3JDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7UUFDL0IsSUFBSSxFQUFFO1lBQ0osU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7WUFDaEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGFBQWE7WUFDbEQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWE7U0FDekQ7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQO1lBQ0UsT0FBTyxFQUFFLDhCQUE4QjtZQUN2QyxPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxxQ0FBcUM7d0JBQzlDLEVBQUUsRUFBRSxRQUFRO3FCQUNiO29CQUNEO3dCQUNFLE9BQU8sRUFBRSwyQkFBMkI7d0JBQ3BDLEVBQUUsRUFBRSxhQUFhO3dCQUNqQixPQUFPLEVBQUU7NEJBQ1AsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO3lCQUMxQztxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSwwQkFBMEI7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsaUNBQWlDO3dCQUMxQyxFQUFFLEVBQUUsUUFBUTt3QkFDWixPQUFPLEVBQUU7NEJBQ1AsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBZTs0QkFDbkMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXNCO3lCQUNsRDtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSwrQkFBK0I7WUFDeEMsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQ0wscUVBQXFFO3dCQUN2RSxFQUFFLEVBQUUsc0JBQXNCO3dCQUMxQixPQUFPLEVBQUU7NEJBQ1AsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNuQixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlOzRCQUNuQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjOzRCQUNsQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZOzRCQUNwQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlOzRCQUNwQyxTQUFTLEVBQUU7Z0NBQ1Qsc0JBQXNCLEVBQUU7b0NBQ3RCLE9BQU8sRUFBRSxpREFBMEI7b0NBQ25DLFFBQVEsRUFBRSxxREFBOEI7aUNBQ3pDOzZCQUNGOzRCQUNELGNBQWMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixJQUFJLElBQUk7eUJBQzNEO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=