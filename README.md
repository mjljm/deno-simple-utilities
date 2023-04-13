# Introduction

DENO open-source library (MIT license) that provides several utilities:

- from-aes-cbc-stream : TransformStream to decipher a stream encrypted with AES
  (Advanced Encryption Standard) in CBC (Cipher Block Chaining) mode.
- to-aes-cbc-stream : TransformStream to cipher a stream using AES (Advanced
  Encryption Standard) in CBC (Cipher Block Chaining) mode.
- to-fixed-length-bytes-stream : TransformStream that turns a stream of
  variable-length Uint8Array's into a stream of fixed-length Uint8Array's.

All utilities are in the ./lib directory.

# API

The API is described directly in each corresponding file. For instance the API
for from-aes-cbc-stream can be found in lib/from-aes-cbc-stream.ts.

# Tests

Tests are located in the ./tests directory and have a '_test.ts' suffix For
instance, tests for from-aes-cbc-stream.ts are in
tests/from-aes-cbc-stream_test.ts.

# Examples

Examples are located in the ./examples directory and have a '_test.ts' suffix
For instance, examples for from-aes-cbc-stream.ts are in
examples/from-aes-cbc-stream_test.ts.

# License

MIT
