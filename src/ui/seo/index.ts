
import { update as updateMetaTag } from './meta-tag'

/**
 * Set page title
 */
export function updatePageTitle (title: string | undefined): void {
  const appName = process.env.VUE_APP_NAME || ''
  if (title) {
    document.title = `${title} | ${appName}`
  } else {
    // clear
    document.title = appName
  }

  // https://ogp.me/#metadata
  updateMetaTag({ property: 'og:title', content: document.title })
}

/**
 * Set page description
 */
export function updatePageDesc (description: string | undefined): void {
  if (typeof description !== 'string') {
    // restore to default
    description = `${process.env.VUE_APP_NAME || ''} — ${process.env.VUE_APP_DESC || ''}`
  }

  updateMetaTag({ name: 'description', content: description })
  updateMetaTag({ property: 'og:description', content: description }) // https://ogp.me/#metadata
}

export interface PageMetadata {
  // explicitly specify undefined to clear
  title: string | undefined;
  description: string | undefined;
}

/**
 * Update page metadata  
 * 
 * set page title & description
 * @see https://codelabs.developers.google.com/codelabs/making-a-single-page-app-search-friendly/index.html
 */
export function updatePageMetadata (meta: PageMetadata): void {
  updatePageTitle(meta.title)
  updatePageDesc(meta.description)
}
