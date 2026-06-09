import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import {
  accountVerificationSubject,
  getAccountVerificationTemplate,
} from './src/emails/account-verification'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/integrations-health",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL!,
              access_key_id: process.env.S3_ACCESS_KEY_ID!,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY!,
              region: process.env.S3_REGION!,
              bucket: process.env.S3_BUCKET!,
              endpoint: process.env.S3_ENDPOINT,
              prefix: process.env.S3_PREFIX ?? "",
              additional_client_config:
                process.env.S3_FORCE_PATH_STYLE === "true"
                  ? { forcePathStyle: true }
                  : {},
            },
          },
        ],
      },
    },
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
              api_key: process.env.SHIPSTATION_API_KEY!,
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
              apiKey: process.env.STRIPE_API_KEY!,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
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
            resolve:
              "@webbers/mailgun-notification-medusa/providers/notification-mailgun",
            id: "notification-mailgun",
            options: {
              channels: ["email"],
              apiKey: process.env.MAILGUN_API_KEY,
              domain: process.env.MAILGUN_DOMAIN,
              from_email: process.env.MAILGUN_FROM,
              api_url: process.env.MAILGUN_API_URL,
              templates: {
                "account-verification": {
                  subject: accountVerificationSubject,
                  template: getAccountVerificationTemplate,
                },
              },
              default_locale: process.env.MAILGUN_DEFAULT_LOCALE || "en",
            },
          },
        ],
      },
    },
  ],
})
