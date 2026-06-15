import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, CheckCircleSolid } from "@medusajs/icons"
import { Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import DocumentTitle from "../../components/document-title"
import { sdk } from "../../lib/sdk"
import IntegrationTableRow from "./integration-table-row"

type IntegrationHealthStatus =
  | "healthy"
  | "misconfigured"
  | "unreachable"

type IntegrationHealthResult = {
  id: string
  name: string
  description: string
  status: IntegrationHealthStatus
  configured: boolean
  accessible: boolean
  message: string | null
  config: {
    label: string
    value: string
  }[]
}

type IntegrationsHealthResponse = {
  integrations_health: {
    checked_at: string
    integrations: IntegrationHealthResult[]
  }
}

const IntegrationsPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["integrations-health"],
    queryFn: () =>
      sdk.client.fetch<IntegrationsHealthResponse>(
        "/admin/integrations/health"
      ),
  })

  const report = data?.integrations_health
  const checkedAt = report?.checked_at
    ? new Date(report.checked_at).toLocaleString()
    : null

  return (
    <>
      <DocumentTitle />
      <div className="flex flex-col gap-4 px-6 py-4">
        <Container className="px-0">
          <div className="flex items-start justify-between gap-4 px-6 py-4">
            <div className="flex flex-col gap-1">
              <Heading level="h1">Integrations</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Live status of third-party services wired into this store. Click a
                row to view configuration and run manual tests.
              </Text>
              {checkedAt && (
                <Text size="xsmall" className="text-ui-fg-muted">
                  Last checked: {checkedAt}
                </Text>
              )}
            </div>
            <Button
              size="small"
              variant="secondary"
              isLoading={isFetching}
              onClick={() => refetch()}
            >
              <ArrowPath />
              Refresh
            </Button>
          </div>
        </Container>

        <Container className="px-0">
          {isLoading ? (
            <div className="px-6 py-8">
              <Text className="text-ui-fg-subtle">Checking integrations...</Text>
            </div>
          ) : error ? (
            <div className="px-6 py-8">
              <Text className="text-ui-fg-error">
                Failed to load integration status.
              </Text>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Service</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Details</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {report?.integrations.map((integration) => (
                  <IntegrationTableRow
                    key={integration.id}
                    integration={integration}
                    isExpanded={expandedId === integration.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === integration.id ? null : integration.id
                      )
                    }
                  />
                ))}
              </Table.Body>
            </Table>
          )}
        </Container>
      </div>
    </>
  )
}

export const handle = {
  breadcrumb: () => "Integrations",
}

export const config = defineRouteConfig({
  label: "Integrations",
  icon: CheckCircleSolid,
  rank: 50,
})

export default IntegrationsPage
