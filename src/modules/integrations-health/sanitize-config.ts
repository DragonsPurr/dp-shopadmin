import { IntegrationId, SanitizedConfigEntry } from "./types"

const NOT_SET = "(not set)"

function isSet(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

function maskSecret(value: string | undefined): string {
  if (!isSet(value)) {
    return NOT_SET
  }

  const trimmed = value!.trim()

  if (trimmed.length <= 4) {
    return "***"
  }

  return `***${trimmed.slice(-4)}`
}

function maskPrefixedSecret(
  value: string | undefined,
  prefixes: string[]
): string {
  if (!isSet(value)) {
    return NOT_SET
  }

  const trimmed = value!.trim()
  const prefix = prefixes.find((candidate) => trimmed.startsWith(candidate))

  if (prefix) {
    return `${prefix}***${trimmed.slice(-4)}`
  }

  return maskSecret(trimmed)
}

function plainEnv(
  label: string,
  key: string,
  secret = false
): SanitizedConfigEntry {
  const value = process.env[key]
  const hasValue = isSet(value)

  return {
    label,
    value: secret ? maskSecret(value) : value?.trim() || NOT_SET,
    sensitive: secret && hasValue,
    reveal_key: secret && hasValue ? key : undefined,
  }
}

function secretEnv(label: string, key: string): SanitizedConfigEntry {
  const value = process.env[key]
  const hasValue = isSet(value)

  return {
    label,
    value: maskSecret(value),
    sensitive: hasValue,
    reveal_key: hasValue ? key : undefined,
  }
}

function parseConnectionUrl(
  envKey: string,
  urlString: string | undefined
): SanitizedConfigEntry[] {
  if (!isSet(urlString)) {
    return [{ label: "Connection URL", value: NOT_SET }]
  }

  try {
    const url = new URL(urlString!.trim())
    const entries: SanitizedConfigEntry[] = [
      { label: "Protocol", value: url.protocol.replace(":", "") },
      { label: "Host", value: url.hostname },
    ]

    if (url.port) {
      entries.push({ label: "Port", value: url.port })
    }

    if (url.username) {
      entries.push({ label: "User", value: decodeURIComponent(url.username) })
    }

    if (url.password) {
      entries.push({
        label: "Password",
        value: "***",
        sensitive: true,
        reveal_key: `${envKey}#password`,
      })
    }

    const path = url.pathname.replace(/^\//, "")

    if (path) {
      entries.push({ label: "Database", value: decodeURIComponent(path) })
    }

    url.searchParams.forEach((paramValue, paramKey) => {
      const sensitive =
        /password|secret|token|key/i.test(paramKey) ||
        /password|secret|token|key/i.test(paramValue)

      entries.push({
        label: paramKey,
        value: sensitive ? maskSecret(paramValue) : paramValue,
        sensitive,
        reveal_key: sensitive ? `${envKey}#query:${paramKey}` : undefined,
      })
    })

    return entries
  } catch {
    return [{ label: "Connection URL", value: "(invalid URL)" }]
  }
}

export function getSanitizedConfig(id: IntegrationId): SanitizedConfigEntry[] {
  switch (id) {
    case "postgres":
      return parseConnectionUrl("DATABASE_URL", process.env.DATABASE_URL)
    case "redis":
      return parseConnectionUrl("REDIS_URL", process.env.REDIS_URL)
    case "s3":
      return [
        plainEnv("Bucket", "S3_BUCKET"),
        plainEnv("Region", "S3_REGION"),
        plainEnv("Endpoint", "S3_ENDPOINT"),
        plainEnv("Public URL", "S3_FILE_URL"),
        plainEnv("Prefix", "S3_PREFIX"),
        plainEnv("Path-style", "S3_FORCE_PATH_STYLE"),
        plainEnv("Access key ID", "S3_ACCESS_KEY_ID", true),
        plainEnv("Secret access key", "S3_SECRET_ACCESS_KEY", true),
      ]
    case "shipstation":
      return [secretEnv("API key", "SHIPSTATION_API_KEY")]
    case "stripe":
      return [
        {
          label: "API key",
          value: maskPrefixedSecret(process.env.STRIPE_API_KEY, [
            "sk_live_",
            "sk_test_",
            "rk_live_",
            "rk_test_",
          ]),
          sensitive: isSet(process.env.STRIPE_API_KEY),
          reveal_key: isSet(process.env.STRIPE_API_KEY)
            ? "STRIPE_API_KEY"
            : undefined,
        },
        {
          label: "Webhook secret",
          value: maskPrefixedSecret(process.env.STRIPE_WEBHOOK_SECRET, [
            "whsec_",
          ]),
          sensitive: isSet(process.env.STRIPE_WEBHOOK_SECRET),
          reveal_key: isSet(process.env.STRIPE_WEBHOOK_SECRET)
            ? "STRIPE_WEBHOOK_SECRET"
            : undefined,
        },
      ]
    case "mailgun":
      return [
        plainEnv("Domain", "MAILGUN_DOMAIN"),
        plainEnv("From address", "MAILGUN_FROM"),
        plainEnv("API URL", "MAILGUN_API_URL"),
        plainEnv("Default locale", "MAILGUN_DEFAULT_LOCALE"),
        plainEnv("API key", "MAILGUN_API_KEY", true),
      ]
    default:
      return []
  }
}

export function getAllowedRevealKeys(id: IntegrationId): Set<string> {
  return new Set(
    getSanitizedConfig(id)
      .map((entry) => entry.reveal_key)
      .filter((key): key is string => Boolean(key))
  )
}

export function revealConfigValue(revealKey: string): string {
  if (revealKey.includes("#")) {
    const [envKey, part] = revealKey.split("#", 2)
    const raw = process.env[envKey]

    if (!isSet(raw)) {
      return NOT_SET
    }

    try {
      const url = new URL(raw!.trim())

      if (part === "password") {
        return url.password ? decodeURIComponent(url.password) : NOT_SET
      }

      if (part.startsWith("query:")) {
        const paramKey = part.slice("query:".length)
        return url.searchParams.get(paramKey) ?? NOT_SET
      }
    } catch {
      return "(invalid URL)"
    }

    return NOT_SET
  }

  return process.env[revealKey]?.trim() || NOT_SET
}
