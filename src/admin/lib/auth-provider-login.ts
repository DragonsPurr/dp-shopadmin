const initLoginRoute = (provider: string) => `/auth/user/${provider}`

const getMedusaUrl = (path: string, params?: Record<string, string>): URL => {
  // @ts-expect-error __BACKEND_URL__ is injected by the Medusa admin build
  const url = new URL(path, __BACKEND_URL__)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  return url
}

export const medusaAuthProviderLogin = async (
  provider: string,
  callbackUrl: string
): Promise<string> => {
  const initLoginUrl = getMedusaUrl(initLoginRoute(provider))
  const response = await fetch(initLoginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback_url: callbackUrl,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to start Google sign-in.")
  }

  const data = await response.json()

  if (!data.location) {
    throw new Error("Google sign-in did not return a redirect URL.")
  }

  return data.location
}

const callbackRoute = (provider: string) => `/auth/user/${provider}/callback`

export const medusaAuthProviderCallback = async (
  provider: string,
  params: Record<string, string>
): Promise<string> => {
  const callbackUrl = getMedusaUrl(callbackRoute(provider), params)
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to complete Google sign-in.")
  }

  const data = await response.json()

  if (!data.token) {
    throw new Error("Google sign-in did not return an access token.")
  }

  return data.token
}

const registerUserRoute = (provider: string) => `/auth/${provider}/register`
const refreshTokenPath = `/auth/token/refresh`
const initSessionPath = `/auth/session`

export const medusaUserRegister = async (
  provider: string,
  token: string
): Promise<void> => {
  const registerUrl = getMedusaUrl(registerUserRoute(provider))
  const response = await fetch(registerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message =
      typeof body?.message === "string"
        ? body.message
        : "Failed to register Google account."
    throw new Error(message)
  }
}

export const medusaTokenRefresh = async (token: string): Promise<string> => {
  const refreshUrl = getMedusaUrl(refreshTokenPath)
  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Failed to refresh access token.")
  }

  const data = await response.json()

  if (!data.token) {
    throw new Error("Token refresh did not return an access token.")
  }

  return data.token
}

export const medusaInitSession = async (token: string): Promise<void> => {
  const sessionUrl = getMedusaUrl(initSessionPath)
  const response = await fetch(sessionUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error("Failed to establish admin session.")
  }
}
