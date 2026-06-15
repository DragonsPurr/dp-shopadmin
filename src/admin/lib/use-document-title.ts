import { isValidElement, type ReactNode } from "react"
import { useLayoutEffect } from "react"
import { useLocation, useMatches, type UIMatch } from "react-router-dom"
import { ADMIN_TITLE, formatPageTitle } from "./constants"

type RouteHandle = {
  breadcrumb?: (match?: UIMatch) => string | ReactNode
}

const getTextFromBreadcrumb = (label: unknown): string | null => {
  if (typeof label === "string") {
    const trimmed = label.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof label === "number") {
    return String(label)
  }

  if (isValidElement<{ children?: unknown }>(label)) {
    return getTextFromBreadcrumb(label.props.children)
  }

  return null
}

const getTitleFromMatchData = (match: UIMatch): string | null => {
  const data = match.data

  if (!data || typeof data !== "object") {
    return null
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (!value || typeof value !== "object") {
      continue
    }

    const entity = value as Record<string, unknown>

    if (typeof entity.title === "string" && entity.title.trim()) {
      return entity.title
    }

    if (typeof entity.name === "string" && entity.name.trim()) {
      return entity.name
    }

    if (
      typeof entity.display_id === "number" ||
      typeof entity.display_id === "string"
    ) {
      return `#${entity.display_id}`
    }

    if (typeof entity.email === "string" && entity.email.trim()) {
      return entity.email
    }
  }

  return null
}

const getPageTitleFromMatches = (
  matches: UIMatch<unknown, RouteHandle>[]
): string | null => {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index]
    const breadcrumb = match.handle?.breadcrumb

    if (!breadcrumb) {
      continue
    }

    const dataTitle = getTitleFromMatchData(match)
    if (dataTitle) {
      return dataTitle
    }

    try {
      const label = getTextFromBreadcrumb(breadcrumb(match))
      if (label) {
        return label
      }
    } catch {
      // Ignore breadcrumb render errors and try the parent route.
    }
  }

  return null
}

type UseDocumentTitleOptions = {
  pageTitle?: string
}

export const useDocumentTitle = ({ pageTitle }: UseDocumentTitleOptions = {}) => {
  const matches = useMatches() as UIMatch<unknown, RouteHandle>[]
  const location = useLocation()

  const resolvedPageTitle =
    pageTitle ?? getPageTitleFromMatches(matches) ?? ADMIN_TITLE

  const title =
    resolvedPageTitle === ADMIN_TITLE
      ? ADMIN_TITLE
      : formatPageTitle(resolvedPageTitle)

  useLayoutEffect(() => {
    document.title = title
  }, [location.key, title])
}
