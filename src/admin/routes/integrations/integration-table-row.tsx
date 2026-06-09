import { ChevronRightMini } from "@medusajs/icons"
import { Badge, clx, Table, Text } from "@medusajs/ui"
import IntegrationConfigList from "./integration-config-list"
import IntegrationTestActions from "./integration-test-actions"

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
    sensitive?: boolean
    reveal_key?: string
  }[]
}

const STATUS_COLOR: Record<
  IntegrationHealthStatus,
  "green" | "orange" | "red"
> = {
  healthy: "green",
  misconfigured: "orange",
  unreachable: "red",
}

const STATUS_LABEL: Record<IntegrationHealthStatus, string> = {
  healthy: "Connected",
  misconfigured: "Not configured",
  unreachable: "Unreachable",
}

type IntegrationTableRowProps = {
  integration: IntegrationHealthResult
  isExpanded: boolean
  onToggle: () => void
}

const IntegrationTableRow = ({
  integration,
  isExpanded,
  onToggle,
}: IntegrationTableRowProps) => {
  return (
    <Table.Row
      className={clx(
        "cursor-pointer hover:bg-ui-bg-base-hover",
        isExpanded && "bg-ui-bg-subtle hover:bg-ui-bg-subtle"
      )}
      onClick={onToggle}
    >
      <Table.Cell colSpan={3} className="p-0">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)] items-start gap-x-6 px-6 py-4">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-ui-fg-muted">
              <ChevronRightMini
                className={clx(
                  "transition-transform duration-200 ease-out",
                  isExpanded && "rotate-90"
                )}
              />
            </span>
            <div className="flex flex-col gap-1">
              <Text weight="plus">{integration.name}</Text>
              <Text size="small" className="text-ui-fg-subtle">
                {integration.description}
              </Text>
            </div>
          </div>
          <div>
            <Badge color={STATUS_COLOR[integration.status]}>
              {STATUS_LABEL[integration.status]}
            </Badge>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              {integration.message ??
                (integration.status === "healthy"
                  ? "Configured and reachable."
                  : "—")}
            </Text>
          </div>
        </div>

        <div
          className={clx(
            "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div
              className={clx(
                "border-t border-ui-border-base px-6 py-4 transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
                isExpanded ? "opacity-100 delay-75" : "opacity-0"
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <Text size="small" weight="plus">
                    Configuration
                  </Text>
                  <IntegrationConfigList
                    integrationId={integration.id}
                    config={integration.config}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Text size="small" weight="plus">
                    Manual test
                  </Text>
                  <IntegrationTestActions integrationId={integration.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default IntegrationTableRow
