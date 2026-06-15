import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Text } from "@medusajs/ui"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import {
  medusaAuthProviderCallback,
  medusaAuthProviderLogin,
  medusaInitSession,
  medusaTokenRefresh,
  medusaUserRegister,
} from "../lib/auth-provider-login"

const GOOGLE_PROVIDER = "google"
const ADMIN_PATH = import.meta.env.VITE_MEDUSA_ADMIN_PATH || "/app"

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred."
}

const GoogleLoginWidget = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentProvider = searchParams.get("provider")
  const oauthCode = searchParams.get("code")

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const callbackUrl = `${window.location.origin}${ADMIN_PATH}/login?provider=${GOOGLE_PROVIDER}`
      const redirectUrl = await medusaAuthProviderLogin(
        GOOGLE_PROVIDER,
        callbackUrl
      )
      window.location.href = redirectUrl
    } catch (loginError) {
      console.error(loginError)
      setError(`Failed to start Google sign-in: ${formatError(loginError)}`)
      setIsLoading(false)
    }
  }

  const handleLoginCallback = async (params: Record<string, string>) => {
    setError(null)
    setIsLoading(true)

    try {
      let token = await medusaAuthProviderCallback(GOOGLE_PROVIDER, params)
      const decodedToken = jwtDecode(token) as { actor_id: string }

      if (!decodedToken.actor_id) {
        await medusaUserRegister(GOOGLE_PROVIDER, token)
        token = await medusaTokenRefresh(token)
      }

      await medusaInitSession(token)

      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname || "/orders"

      navigate(from, { replace: true })
    } catch (callbackError) {
      console.error(callbackError)
      setError(`Failed to complete Google sign-in: ${formatError(callbackError)}`)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentProvider !== GOOGLE_PROVIDER || !oauthCode) {
      return
    }

    const params = Object.fromEntries(
      Array.from(searchParams.entries()).filter(
        ([key]) => key !== "provider"
      ) as [string, string][]
    )

    void handleLoginCallback(params)
  }, [currentProvider, oauthCode, searchParams])

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="relative flex items-center py-2">
        <div className="grow border-t border-ui-border-base" />
        <Text
          size="small"
          leading="compact"
          className="mx-3 shrink-0 text-ui-fg-subtle"
        >
          or
        </Text>
        <div className="grow border-t border-ui-border-base" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => void handleLogin()}
        disabled={isLoading}
        isLoading={isLoading}
      >
        Continue with Google Workspace
      </Button>

      {error ? (
        <Text size="small" className="text-ui-fg-error">
          {error}
        </Text>
      ) : null}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "login.after",
})

export default GoogleLoginWidget
