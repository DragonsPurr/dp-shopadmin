import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATIONS_HEALTH_MODULE } from "../../../../modules/integrations-health"
import IntegrationsHealthService from "../../../../modules/integrations-health/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const integrationsHealthService: IntegrationsHealthService =
    req.scope.resolve(INTEGRATIONS_HEALTH_MODULE)

  const report = await integrationsHealthService.getHealthReport()

  res.json({ integrations_health: report })
}
