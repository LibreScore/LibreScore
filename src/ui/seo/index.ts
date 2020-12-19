
/**
 * Set page title
 */
export const updatePageTitle = (title: string | undefined): void => {
  const appName = process.env.VUE_APP_NAME || ''
  if (title) {
    document.title = `${title} | ${appName}`
  } else {
    // clear
    document.title = appName
  }
}

/**
 * Set page description
 */
export const updatePageDesc = (description: string | undefined): void => {
  const el = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (typeof description === 'string') {
    el.setAttribute('content', description)
  } else {
    // restore to default
    el.setAttribute('content', `${process.env.VUE_APP_NAME || ''} — ${process.env.VUE_APP_DESC || ''}`)
  }
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
export const updatePageMetadata = (meta: PageMetadata): void => {
  updatePageTitle(meta.title)
  updatePageDesc(meta.description)
}
