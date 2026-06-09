const fs = require("fs")
const net = require("net")
const path = require("path")

const SKIP_FLAG = path.join(__dirname, ".skip-http-integration")

function portOpen(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end()
      resolve(true)
    })

    socket.on("error", () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

function applyTestDatabaseEnv(databaseUrl, redisUrl) {
  process.env.DATABASE_URL = databaseUrl
  process.env.REDIS_URL = redisUrl

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
    // setup.js will retry parsing if needed.
  }
}

module.exports = async () => {
  if (fs.existsSync(SKIP_FLAG)) {
    fs.unlinkSync(SKIP_FLAG)
  }

  if (process.env.TEST_DATABASE_URL) {
    applyTestDatabaseEnv(
      process.env.TEST_DATABASE_URL,
      process.env.TEST_REDIS_URL ?? "redis://localhost:6380"
    )
    return
  }

  const localDatabaseUrl =
    "postgres://postgres:postgres@localhost:5433/medusa_integration_test"
  const localRedisUrl = "redis://localhost:6380"
  const localPostgresReady = await portOpen("127.0.0.1", 5433)

  if (localPostgresReady) {
    applyTestDatabaseEnv(localDatabaseUrl, localRedisUrl)
    return
  }

  fs.writeFileSync(SKIP_FLAG, "1")
}
