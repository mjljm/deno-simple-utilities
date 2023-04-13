// Transforms a stream of variable-length Uint8Arrays into a stream of fixed-length Uint8Arrays.
//
// Apart from the first Uint8Array that can have a different length, the following Uint8Arrays have
// the same length or, optionally, a length that is a multiple of a given length.
// If allowed, a last Uint8Array with the remaining bytes is created. Otherwise, an error is thrown.

// Transform callbacks can be passed for the first, last and all other chunks.

// This class is useful for instance for decoding AES streams that expect 16-byte chunks as
// inputs. See aes_cbc_crypto_stream deno third-party library for an implementation example.

import { BytesList } from "../deps.ts";

export class ToFixedLengthBytesStream
  extends TransformStream<Uint8Array, Uint8Array> {
  /**
   * Constructor
   * @param firstChunkLength - The length of the first chunk. If 0, the first chunk is handled like other chunks.
   * @param otherChunksLength - The length of each chunk except the first one if firstChunkLength > 0 and the last one if its length is strictly inferior to otherChunksLength.
   * @param allowMultiples - Applies to all chunks except the first one if firstChunkLength > 0 and the last one if its length is trictly inferior to otherChunksLength.
   * If false (default value), then the afore-mentioned chunks will be of length otherChunksLengths.
   * If true, then the afore-mentioned chunks will be of length k*otherChunksLengths (where k is a strictly positive integer).
   * @param transformFirstChunk - A callback that will be called for the first chunk if firstChunkLength > 0 and there are at least firstChunkLength bytes in the stream. Return modified chunk if needed. Default is identity function.
   * @param transformOtherChunks - A callback that will be called for all chunks except the first one if firstChunkLength > 0 and the last one if its length is strictly inferior to otherChunksLength. The _eos parameter is true if the passed chunk is the last one. Return modified chunk if needed. Default is identity function.
   * @param transformLastChunk - A callback that will be called for the last chunk if its length is strictly inferior to otherChunksLength. Note : if there is one single chunk whose length is inferior to firstChunkLength, this callback is called for that chunk. Return modified chunk if needed. Default is identity function.
   *
   * @throws RangeError if firstChunkLength is not a positive integer or otherChunksLength is not a strictly positive integer.
   */

  constructor(
    firstChunkLength: number,
    otherChunksLength: number,
    allowMultiples = false,
    transformFirstChunk = (chunk: Uint8Array) => chunk,
    transformOtherChunks = (chunk: Uint8Array, _eos: boolean) => chunk,
    transformLastChunk = (chunk: Uint8Array) => chunk,
  ) {
    if (!Number.isInteger(firstChunkLength) || firstChunkLength < 0.0) {
      throw new RangeError(
        "firstChunkLength must be a positive integer.",
      );
    }
    if (!Number.isInteger(otherChunksLength) || otherChunksLength <= 0.0) {
      throw new RangeError(
        "otherChunksLength must be a strictly positive integer.",
      );
    }
    let firstChunk = firstChunkLength > 0.0;
    const leftOver = new BytesList();

    super({
      transform(chunk, controller) {
        leftOver.add(chunk);
        let readLength = 0;
        const initialLength = leftOver.size();
        let leftLength = initialLength;

        while (
          leftLength >= (firstChunk ? firstChunkLength : otherChunksLength)
        ) {
          if (firstChunk) {
            firstChunk = false;
            const usableChunk = transformFirstChunk(
              leftOver.slice(0, readLength = firstChunkLength),
            );
            if (usableChunk.length > 0) controller.enqueue(usableChunk);
            leftLength -= firstChunkLength;
          } else {
            const usableLength = allowMultiples
              ? Math.floor(
                leftLength / otherChunksLength,
              ) *
                otherChunksLength
              : otherChunksLength;
            const usableChunk = transformOtherChunks(
              leftOver.slice(readLength, readLength += usableLength),
              readLength === initialLength,
            );
            if (usableChunk.length > 0) controller.enqueue(usableChunk);
            leftLength -= usableLength;
          }
        }
        leftOver.shift(readLength);
      },
      flush(controller) {
        if (leftOver.size() > 0) {
          const usableChunk = transformLastChunk(leftOver.slice(0));
          if (usableChunk.length > 0) controller.enqueue(usableChunk);
        }
      },
    });
  }
}
