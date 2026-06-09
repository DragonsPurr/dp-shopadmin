import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { INTEGRATIONS_HEALTH_MODULE } from "../../../../../modules/integrations-health"
import IntegrationsHealthService from "../../../../../modules/integrations-health/service"
import { IntegrationId } from "../../../../../modules/integrations-health/types"

const VALID_IDS: IntegrationId[] = [
  "postgres",
  "redis",
  "s3",
  "shipstation",
  "stripe",
  "mailgun",
]

function isIntegrationId(value: string): value is IntegrationId {
  return VALID_IDS.includes(value as IntegrationId)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  if (!id || !isIntegrationId(id)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Unknown integration: ${id ?? "undefined"}`
    )
  }

  const integrationsHealthService: IntegrationsHealthService =
    req.scope.resolve(INTEGRATIONS_HEALTH_MODULE)

  const body = (req.body ?? {}) as {
    object_key?: string
    to?: string
  }

  const result = await integrationsHealthService.runIntegrationTest(id, body)

  res.json({ integration_test: result })
}
