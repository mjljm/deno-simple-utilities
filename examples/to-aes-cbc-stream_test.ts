import { Padding } from "thp/crypto@v0.10.0/block-modes.ts";
import { FromAesCbcStream, ToAesCbcStream } from "../mod.ts";
import { readableStreamFromIterable } from "std/streams/readable_stream_from_iterable.ts";
import { assertEquals } from "std/testing/asserts.ts";

Deno.test("Example", async () => {
  const te = new TextEncoder();
  const td = new TextDecoder();

  const key = te.encode("SuperDuperSecretSuperDuperSecret");
  const iv = te.encode("HushItsASecret!!");

  const story = "A short story. It's just an example!";
  const data = te.encode(story);

  const testStream = readableStreamFromIterable([data]);
  const encryptedStream = testStream.pipeThrough(
    new ToAesCbcStream(key, Padding.PKCS7, iv, true),
  );
  const decryptedStream = encryptedStream.pipeThrough(
    new FromAesCbcStream(key, Padding.PKCS7),
  );
  let decryptedText = "";
  for await (const chunk of decryptedStream) decryptedText += td.decode(chunk);

  assertEquals(decryptedText, story);
});
