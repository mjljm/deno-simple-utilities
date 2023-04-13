import { assertEquals, assertThrows } from "std/testing/asserts.ts";

import { readableStreamFromIterable } from "../deps.ts";
import { ToFixedLengthBytesStream } from "../lib/to-fixed-length-bytes-stream.ts";

class ChunkSizeTestTransformStream
  extends TransformStream<Uint8Array, Uint8Array> {
  constructor(expectedLengths: number[]) {
    const actualLengths: number[] = [];

    super({
      transform(chunk, controller) {
        actualLengths.push(chunk.length);
        controller.enqueue(chunk);
      },
      flush() {
        assertEquals(
          actualLengths.toString(),
          expectedLengths.toString(),
        );
      },
    });
  }
}

Deno.test("Parameter 1 not integer", () => {
  assertThrows(
    () => new ToFixedLengthBytesStream(11.3, 4),
    RangeError,
  );
});
Deno.test("Parameter 1 negative", () => {
  assertThrows(
    () => new ToFixedLengthBytesStream(-11, 4),
    RangeError,
  );
});
Deno.test("Parameter 2 not integer", () => {
  assertThrows(
    () => new ToFixedLengthBytesStream(11, 4.3),
    RangeError,
  );
});
Deno.test("Parameter 2 negative", () => {
  assertThrows(
    () => new ToFixedLengthBytesStream(11, -4),
    RangeError,
  );
});

Deno.test("Check chunk sizes (1)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(12),
    new Uint8Array(44),
    new Uint8Array(8),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(16, 16),
  ).pipeThrough(new ChunkSizeTestTransformStream([16, 16, 16, 16])).pipeTo(
    Deno.stdout.writable,
    {
      preventClose: true,
      preventAbort: true,
    },
  );
});

Deno.test("Check chunk sizes (2)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(1024),
    new Uint8Array(512),
    new Uint8Array(2048),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(16, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([16, 1008, 512, 2048]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (3)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(1022),
    new Uint8Array(512),
    new Uint8Array(2048),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(16, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([16, 992, 512, 2048, 14]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (4)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(1022),
    new Uint8Array(512),
    new Uint8Array(2048),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(10000, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([3582]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (5)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(1022),
    new Uint8Array(512),
    new Uint8Array(2048),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(0, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([1008, 512, 2048, 14]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (6)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(14),
    new Uint8Array(1022),
    new Uint8Array(512),
    new Uint8Array(2048),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(0, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([1024, 512, 2048, 12]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (7)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(14),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(0, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([14]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});

Deno.test("Check chunk sizes (8)", async () => {
  const testStream1 = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(14),
  ]);
  await testStream1.pipeThrough(
    new ToFixedLengthBytesStream(15, 16, true),
  ).pipeThrough(new ChunkSizeTestTransformStream([14]))
    .pipeTo(
      Deno.stdout.writable,
      {
        preventClose: true,
        preventAbort: true,
      },
    );
});
