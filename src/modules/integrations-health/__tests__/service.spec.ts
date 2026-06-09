import { MedusaError } from "@medusajs/framework/utils"
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { INTEGRATIONS_HEALTH_MODULE } from ".."
import IntegrationsHealthService from "../service"

jest.setTimeout(60 * 1000)

moduleIntegrationTestRunner<IntegrationsHealthService>({
  moduleName: INTEGRATIONS_HEALTH_MODULE,
  resolve: "./src/modules/integrations-health",
  testSuite: ({ service }) => {
    describe("IntegrationsHealthService", () => {
      it("returns a health report for all integrations", async () => {
        const report = await service.getHealthReport()

        expect(report.checked_at).toEqual(expect.any(String))
        expect(report.integrations).toHaveLength(6)
        expect(report.integrations.map((integration) => integration.id)).toEqual(
          expect.arrayContaining([
            "postgres",
            "redis",
            "s3",
            "shipstation",
            "stripe",
            "mailgun",
          ])
        )

        for (const integration of report.integrations) {
          expect(integration.config.length).toBeGreaterThan(0)
        }
      })

      it("reveals allowed config values", () => {
        process.env.SHIPSTATION_API_KEY = "integration-test-key"

        expect(service.revealConfig("shipstation", "SHIPSTATION_API_KEY")).toEqual(
          {
            value: "integration-test-key",
          }
        )
      })

      it("rejects reveal requests for unknown keys", () => {
        expect(() =>
          service.revealConfig("stripe", "SHIPSTATION_API_KEY")
        ).toThrow(MedusaError)
      })
    })
  },
})
