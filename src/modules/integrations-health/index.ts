import { Module } from "@medusajs/framework/utils"
import IntegrationsHealthService from "./service"

export const INTEGRATIONS_HEALTH_MODULE = "integrationsHealth"

export default Module(INTEGRATIONS_HEALTH_MODULE, {
  service: IntegrationsHealthService,
})
