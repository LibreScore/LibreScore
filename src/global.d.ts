
declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}

declare module '*.svg' {
  const url: string
  export default url
}

declare module '*.png' {
  const url: string
  export default url
}
declare module 'cbor' {
  const cbor: {
    /**
     * @param input hex string (default) or binary data with `encoding: 'binary'`
     */
    decode: (input: string | Uint8Array | ArrayBuffer, options?: { encoding?: string }) => unknown
    encode: (value: unknown) => Uint8Array
  }
  export = cbor
}
