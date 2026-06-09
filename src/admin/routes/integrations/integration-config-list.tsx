import { EyeMini, EyeSlashMini } from "@medusajs/icons"
import { Button, clx, Text } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { type MouseEvent, useState } from "react"
import { sdk } from "../../lib/sdk"

type SanitizedConfigEntry = {
  label: string
  value: string
  sensitive?: boolean
  reveal_key?: string
}

type ConfigRevealResponse = {
  config_reveal: {
    value: string
  }
}

type ConfigValueProps = {
  entry: SanitizedConfigEntry
  integrationId: string
}

const ConfigValue = ({ entry, integrationId }: ConfigValueProps) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [revealedValue, setRevealedValue] = useState<string | null>(null)

  const revealMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<ConfigRevealResponse>(
        `/admin/integrations/${integrationId}/config/reveal`,
        {
          method: "POST",
          body: { reveal_key: entry.reveal_key },
        }
      ),
    onSuccess: (data) => {
      setRevealedValue(data.config_reveal.value)
      setIsRevealed(true)
    },
  })

  if (!entry.sensitive || !entry.reveal_key) {
    return (
      <Text size="xsmall" className="break-all font-mono text-ui-fg-muted">
        {entry.value}
      </Text>
    )
  }

  const displayValue =
    isRevealed && revealedValue !== null ? revealedValue : entry.value

  const handleToggleReveal = (event: MouseEvent) => {
    event.stopPropagation()

    if (isRevealed) {
      setIsRevealed(false)
      return
    }

    if (revealedValue !== null) {
      setIsRevealed(true)
      return
    }

    revealMutation.mutate()
  }

  return (
    <div className="flex items-start gap-1">
      <Text
        size="xsmall"
        className={clx(
          "min-w-0 flex-1 break-all font-mono text-ui-fg-muted",
          isRevealed && "text-ui-fg-base"
        )}
      >
        {displayValue}
      </Text>
      <Button
        type="button"
        size="small"
        variant="transparent"
        className="shrink-0 text-ui-fg-muted"
        isLoading={revealMutation.isPending}
        onClick={handleToggleReveal}
        aria-label={isRevealed ? "Hide value" : "Reveal value"}
      >
        {isRevealed ? <EyeSlashMini /> : <EyeMini />}
      </Button>
    </div>
  )
}

type IntegrationConfigListProps = {
  integrationId: string
  config: SanitizedConfigEntry[]
}

const IntegrationConfigList = ({
  integrationId,
  config,
}: IntegrationConfigListProps) => {
  if (!config.length) {
    return (
      <Text size="xsmall" className="text-ui-fg-muted">
        —
      </Text>
    )
  }

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {config.map((entry) => (
        <div key={entry.label} className="flex flex-col gap-0.5">
          <Text size="xsmall" weight="plus" className="text-ui-fg-subtle">
            {entry.label}
          </Text>
          <ConfigValue entry={entry} integrationId={integrationId} />
        </div>
      ))}
    </dl>
  )
}

export default IntegrationConfigList
