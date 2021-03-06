const { Readable, Writable } = require('streamx')
require('fast-readable-async-iterator')

function BlobReadStream (blob, opts = {}) {
  return Readable.from(blob.stream(), opts)
}

class BlobWriteStream extends Writable {
  constructor (callback, opts = {}) {
    super(Object.assign({ decodeStrings: false }, opts))
    this.chunks = []
    const mimeType = opts.mimeType
    this.once('close', () => {
      const blob = mimeType != null ? new Blob(this.chunks, { type: mimeType }) : new Blob(this.chunks)
      callback(blob)
      this.emit('blob', blob)
    })
  }

  _write (data, cb) {
    this.chunks.push(data)
    cb()
  }
}

module.exports = { BlobWriteStream, BlobReadStream }
