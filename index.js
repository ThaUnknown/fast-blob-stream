const { Readable, Writable } = require('streamx')

class BlobReadStream extends Readable {
  constructor(blob, opts = {}) {
    super(opts)
    this.reader = (async function* () {
      const stream = blob.stream()
      const reader = stream.getReader()
      let last = reader.read()
      while (!last.done) {
        const temp = last
        last = reader.read()
        yield (await temp).value
      }
      yield (await last).value
    })()
  }

  async _read(cb) {
    if (this.destroyed) return
    const { value } = await this.reader.next()
    if (value == null) this.destroy()
    this.push(value || null)
    cb()
  }
}

class BlobWriteStream extends Writable {
  constructor(callback, opts = {}) {
    super(Object.assign({ decodeStrings: false }, opts))
    this.chunks = []
    const mimeType = opts.mimeType
    this.once('close', () => {
      const blob = mimeType != null ? new Blob(chunks, { type: mimeType }) : new Blob(chunks)
      callback(blob)
      this.emit('blob', blob)
    })
  }

  _write(data, cb) {
    this.chunks.push(data)
    cb()
  }
}

module.exports = { BlobWriteStream, BlobReadStream }