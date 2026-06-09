import { Button, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/sdk"

type IntegrationTestResponse = {
  integration_test: {
    id: string
    success: boolean
    message: string
    details: Record<string, unknown> | null
  }
}

type IntegrationTestActionsProps = {
  integrationId: string
}

const IntegrationTestActions = ({
  integrationId,
}: IntegrationTestActionsProps) => {
  const [objectKey, setObjectKey] = useState("")
  const [email, setEmail] = useState("")
  const [lastResult, setLastResult] = useState<string | null>(null)

  const testMutation = useMutation({
    mutationFn: (body: Record<string, string>) =>
      sdk.client.fetch<IntegrationTestResponse>(
        `/admin/integrations/${integrationId}/test`,
        {
          method: "POST",
          body,
        }
      ),
    onSuccess: (data) => {
      const result = data.integration_test
      setLastResult(result.message)

      if (result.success) {
        toast.success("Test passed", { description: result.message })
      } else {
        toast.error("Test failed", { description: result.message })
      }
    },
    onError: () => {
      setLastResult("Request failed.")
      toast.error("Test failed", {
        description: "Could not run the integration test.",
      })
    },
  })

  const runTest = (body: Record<string, string> = {}) => {
    testMutation.mutate(body)
  }

  return (
    <div className="flex flex-col gap-2">
      {integrationId === "s3" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`s3-key-${integrationId}`}>Object key</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`s3-key-${integrationId}`}
              size="small"
              placeholder="products/image.png"
              value={objectKey}
              onChange={(event) => setObjectKey(event.target.value)}
            />
            <Button
              size="small"
              variant="secondary"
              isLoading={testMutation.isPending}
              disabled={!objectKey.trim()}
              onClick={() => runTest({ object_key: objectKey.trim() })}
            >
              Fetch object
            </Button>
          </div>
        </div>
      )}

      {integrationId === "mailgun" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`mailgun-to-${integrationId}`}>Send test email to</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`mailgun-to-${integrationId}`}
              size="small"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              size="small"
              variant="secondary"
              isLoading={testMutation.isPending}
              disabled={!email.trim()}
              onClick={() => runTest({ to: email.trim() })}
            >
              Send test
            </Button>
          </div>
        </div>
      )}

      {(integrationId === "shipstation" ||
        integrationId === "stripe" ||
        integrationId === "postgres" ||
        integrationId === "redis") && (
        <Button
          size="small"
          variant="secondary"
          isLoading={testMutation.isPending}
          onClick={() => runTest()}
        >
          {integrationId === "shipstation"
            ? "List carriers"
            : integrationId === "stripe"
              ? "Fetch account"
              : integrationId === "postgres"
                ? "Run query"
                : "Ping & read/write"}
        </Button>
      )}

      {lastResult && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {lastResult}
        </Text>
      )}
    </div>
  )
}

export default IntegrationTestActions
