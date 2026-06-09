const { MetadataStorage } = require("@medusajs/framework/mikro-orm/core")

MetadataStorage.clear()

function syncDbEnvFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl || process.env.DB_USERNAME) {
    return
  }

  try {
    const parsed = new URL(databaseUrl)

    process.env.DB_HOST = parsed.hostname
    process.env.DB_PORT = parsed.port || "5432"
    process.env.DB_USERNAME = decodeURIComponent(parsed.username)
    process.env.DB_PASSWORD = decodeURIComponent(parsed.password)
    process.env.DB_NAME = decodeURIComponent(
      parsed.pathname.replace(/^\//, "").split("?")[0]
    )
  } catch {
    // Leave existing DB_* values unchanged when DATABASE_URL is invalid.
  }
}

syncDbEnvFromDatabaseUrl()
