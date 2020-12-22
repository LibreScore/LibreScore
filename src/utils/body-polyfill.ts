// polyfill Response.prototype.body
// https://developer.mozilla.org/en-US/docs/Web/API/Body/body

if (!Object.getOwnPropertyDescriptor(Response.prototype, 'body')) {
  Object.defineProperty(Response.prototype, 'body', {
    get () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const res: Response = this
      return new ReadableStream<Uint8Array>({
        async start (controller) {
          const buf = await res.arrayBuffer()
          controller.enqueue(new Uint8Array(buf))
          controller.close()
        },
      })
    },
    enumerable: true,
    configurable: true,
  })
}
