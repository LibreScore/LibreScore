
const TARGET = document.head
const KEY_ATTR = 'data-app-controlled'

function findAll () {
  return [...TARGET.querySelectorAll<HTMLMetaElement>(`meta[${KEY_ATTR}]`)]
}

/**
 * Remove all stale meta tags using the key attribute we set
 */
export function clear (): void {
  findAll().forEach((el) => el.remove())
}

/**
 * meta tag definitions
 */
export type TagDef =
  | { property: string; content: string } // https://ogp.me/
  | { name: string; content: string }
const KEY_NAMES = ['property', 'name']

/**
 * Add a meta tag to the document  
 */
export function add (tagDef: TagDef): HTMLMetaElement {
  const tag = document.createElement('meta')

  // turn definitions into tag attributes
  Object.entries(tagDef)
    .forEach(([k, v]) => {
      tag.setAttribute(k, v)
    })

  // set the key attribute to track meta tags we created here,
  // so that we don't interfere with others.
  tag.setAttribute(KEY_ATTR, '')

  // add the meta tag element to the document head
  TARGET.appendChild(tag)

  return tag
}

/**
 * Update (or Add) a meta tag
 */
export function update (tagDef: TagDef): HTMLMetaElement {
  const keyName = Object.keys(tagDef).find(k => KEY_NAMES.includes(k as any))
  if (!keyName) throw new TypeError()

  // look for existing meta tag element
  const tag = findAll().find(el => {
    const attr = el.getAttribute(keyName)
    return attr && attr === tagDef[keyName]
  })
  if (!tag) { // not found
    // add a new meta tag
    return add(tagDef)
  }

  // update meta tag content
  tag.setAttribute('content', tagDef.content)

  return tag
}
