import { useDocumentTitle } from "../lib/use-document-title"

type DocumentTitleProps = {
  pageTitle?: string
}

const DocumentTitle = ({ pageTitle }: DocumentTitleProps) => {
  useDocumentTitle({ pageTitle })

  return null
}

export default DocumentTitle
