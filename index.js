const { Readable, Writable } = require('readable-stream')
const { Buffer } = require('buffer')

class BlobReadStream extends Readable {
  constructor(blob, opts = {}) {
    super(opts)
    this.destroyed = false
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

  async _read() {
    if (this.destroyed) return
    const { value } = await this.reader.next()
    if (value == null) this.destroyed = true
    this.push(value || null)
  }
}

class BlobWriteStream extends Writable {
  constructor(callback, opts = {}) {
    super(Object.assign({ decodeStrings: false }, opts))
    this.chunks = []
    const mimeType = opts.mimeType
    this.once('end', () => {
      const blob = mimeType != null ? new Blob(chunks, { type: mimeType }) : new Blob(chunks)
      callback(blob)
      this.emit('blob', blob)
    })
  }

  _write(chunk, enc, callback) {
    this.chunks.push(chunk)
    callback()
  }
}

module.exports = { BlobWriteStream, BlobReadStream }