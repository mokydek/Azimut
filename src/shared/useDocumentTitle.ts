import { useEffect } from 'react'

// Sets document.title for the current page and restores nothing on unmount;
// the next page sets its own title.
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
