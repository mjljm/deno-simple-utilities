import { assertEquals } from "std/testing/asserts.ts";

import {
  Aes,
  Cbc,
  concat,
  Padding,
  readableStreamFromIterable,
} from "../deps.ts";

import { FromAesCbcStream } from "../lib/from-aes-cbc-stream.ts";

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

const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
const encrypted = cipher.encrypt(data);

Deno.test("Decrypt with iv passed as parameter", async () => {
  const testStream = readableStreamFromIterable<Uint8Array>(
    [
      encrypted.slice(0, 15),
      encrypted.slice(15, 97),
      encrypted.slice(97, 231),
      encrypted.slice(231, 299),
      encrypted.slice(299, 413),
      encrypted.slice(413),
    ],
  );

  const decryptedStream = testStream.pipeThrough(
    new FromAesCbcStream(key, Padding.PKCS7, iv),
  );
  let decryptedText = "";
  for await (const chunk of decryptedStream) decryptedText += td.decode(chunk);
  assertEquals(decryptedText, story);
});

Deno.test("Decrypt with iv passed at file start", async () => {
  const encryptedWithIV = concat(iv, encrypted);
  const testStream = readableStreamFromIterable<Uint8Array>(
    [
      encryptedWithIV.slice(0, 390),
      encryptedWithIV.slice(390),
    ],
  );

  const decryptedStream = testStream.pipeThrough(
    new FromAesCbcStream(key, Padding.PKCS7),
  );
  let decryptedText = "";
  for await (const chunk of decryptedStream) decryptedText += td.decode(chunk);
  assertEquals(decryptedText, story);
});
