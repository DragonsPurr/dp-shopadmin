export type IntegrationId =
  | "postgres"
  | "redis"
  | "s3"
  | "shipstation"
  | "stripe"
  | "mailgun"

export type IntegrationHealthStatus =
  | "healthy"
  | "misconfigured"
  | "unreachable"

export type SanitizedConfigEntry = {
  label: string
  value: string
  sensitive?: boolean
  reveal_key?: string
}

export type IntegrationHealthResult = {
  id: IntegrationId
  name: string
  description: string
  status: IntegrationHealthStatus
  configured: boolean
  accessible: boolean
  message: string | null
  config: SanitizedConfigEntry[]
}

export type IntegrationsHealthReport = {
  checked_at: string
  integrations: IntegrationHealthResult[]
}

export type IntegrationTestInput = {
  object_key?: string
  to?: string
}

export type IntegrationTestResult = {
  id: IntegrationId
  success: boolean
  message: string
  details: Record<string, unknown> | null
}
