import { assertEquals } from "std/testing/asserts.ts";

import {
  Aes,
  Cbc,
  concat,
  Padding,
  readableStreamFromIterable,
} from "../deps.ts";

import { FromAesCbcStream } from "../lib/from-aes-cbc-stream.ts";
import { ToAesCbcStream } from "../lib/to-aes-cbc-stream.ts";

const te = new TextEncoder();
const td = new TextDecoder();

const key = te.encode("SuperDuperSecretSuperDuperSecret");
const iv = te.encode("HushItsASecret!!");
const story =
"Once upon a time there lived a king and queen who were very unhappy \
because they had no children. But at last a little daughter was born, and their \
sorrow was turned to joy. All the bells in the land were rung to tell the glad tidings.\n\n\
The king gave a christening feast so grand that the like of it had never been known. \
He invited all the fairies he could find in the kingdom—there were seven of them—to \
come to the christening as godmothers. He hoped that each would give the princess a good gift.";
const data = te.encode(story);

Deno.test("Encrypt without iv at file start", async () => {
  const testStream = readableStreamFromIterable<Uint8Array>(
    [
      data.slice(0, 15),
      data.slice(15, 97),
      data.slice(97, 231),
      data.slice(231, 299),
      data.slice(299, 413),
      data.slice(413),
    ],
  );

  const encryptedStream = testStream.pipeThrough(
    new ToAesCbcStream(key, Padding.PKCS7, iv, false),
  );
  let encryptedBytes = new Uint8Array();
  for await (const chunk of encryptedStream) {
    encryptedBytes = concat(encryptedBytes, chunk);
  }
  const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
  assertEquals(td.decode(decipher.decrypt(encryptedBytes)), story);
});

Deno.test("Encrypt with iv at file start", async () => {
  const testStream = readableStreamFromIterable<Uint8Array>(
    [
      data.slice(0, 231),
      data.slice(231, 299),
      data.slice(299, 413),
      data.slice(413),
    ],
  );

  const encryptedStream = testStream.pipeThrough(
    new ToAesCbcStream(key, Padding.PKCS7, iv, true),
  );
  let encryptedBytes = new Uint8Array();
  for await (const chunk of encryptedStream) {
    encryptedBytes = concat(encryptedBytes, chunk);
  }
  const readIv = encryptedBytes.slice(0, 16);
  encryptedBytes = encryptedBytes.slice(16);
  const decipher = new Cbc(Aes, key, readIv, Padding.PKCS7);
  assertEquals(td.decode(decipher.decrypt(encryptedBytes)), story);
});

Deno.test("Encrypt and decrypt", async () => {
  const testStream = readableStreamFromIterable<Uint8Array>([data]);

  const encryptedStream = testStream.pipeThrough(
    new ToAesCbcStream(key, Padding.PKCS7, iv, true),
  );

  const chunks = new Array<Uint8Array>();

  for await (const chunk of encryptedStream) {
    const halfLen = Math.floor(chunk.length / 2);
    chunks.push(chunk.slice(0, halfLen));
    chunks.push(chunk.slice(halfLen));
  }

  const splitEncryptedStream = readableStreamFromIterable(chunks);

  const decryptedStream = splitEncryptedStream.pipeThrough(
    new FromAesCbcStream(key, Padding.PKCS7),
  );

  let decryptedText = "";
  for await (const chunk of decryptedStream) decryptedText += td.decode(chunk);
  assertEquals(decryptedText, story);
});
