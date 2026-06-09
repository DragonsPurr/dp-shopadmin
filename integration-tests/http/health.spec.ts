import fs from "fs"
import path from "path"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

jest.setTimeout(120 * 1000)

const skipFlag = path.join(process.cwd(), "integration-tests/.skip-http-integration")

if (fs.existsSync(skipFlag)) {
  describe("HTTP integration (skipped)", () => {
    it("requires local test Postgres — run: npm run test:integration:http:services", () => {
      expect(true).toBe(true)
    })
  })
} else {
  medusaIntegrationTestRunner({
    inApp: true,
    env: {},
    testSuite: ({ api, getContainer }) => {
      describe("Health", () => {
        it("responds on the health endpoint", async () => {
          const response = await api.get("/health")

          expect(response.status).toEqual(200)
        })
      })

      describe("Store custom route", () => {
        it("responds on the example store route", async () => {
          const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
          const { data: keys } = await query.graph({
            entity: "api_key",
            fields: ["token"],
            filters: {
              type: "publishable",
            },
          })

          const response = await api.get("/store/custom", {
            headers: {
              "x-publishable-api-key": keys[0].token,
            },
          })

          expect(response.status).toEqual(200)
        })
      })
    },
  })
}
