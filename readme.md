# Fast Blob Stream

Low latency `blob -> node readable` and `node writable -> blob`.

For readable, caches 1 value ahead, eliminating potential latency caused by code ran in-between reads.

For writable, pulls as much data as possible, as fast as possible. 

## Usage:
```js
import { BlobReadStream, BlobWriteStream } from 'fast-blob-stream'

const readStream = new BlobReadStream(blob, opts)

const writeStream = new BlobWriteStream(console.log, { mimeType: 'video/mp4', ...opts }) // logs blob once generated

writeStream.on('blob', console.log) // also logs blob once generated

someStream.pipe(writeStream)
```