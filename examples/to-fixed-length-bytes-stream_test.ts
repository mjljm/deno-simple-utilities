import { readableStreamFromIterable } from "std/streams/readable_stream_from_iterable.ts";
import { ToFixedLengthBytesStream } from "../mod.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("Example", async () => {
  const inputStream = readableStreamFromIterable<Uint8Array>([
    new Uint8Array(12),
    new Uint8Array(44),
    new Uint8Array(8),
  ]);
  const outputStream = inputStream.pipeThrough(
    new ToFixedLengthBytesStream(13, 16, false),
  );

  const results: number[] = [];
  for await (const chunk of outputStream) results.push(chunk.length);

  assertEquals(results.toString(), "13,16,16,16,3");
});
