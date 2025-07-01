declare module 'tweetnacl' {
  export interface KeyPair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
  }

  export namespace sign {
    function keyPair(): KeyPair;
    namespace keyPair {
      function fromSecretKey(secretKey: Uint8Array): KeyPair;
    }
    function detached(message: Uint8Array, secretKey: Uint8Array): Uint8Array;
    function verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
  }

  export namespace util {
    function encodeBase64(arr: Uint8Array): string;
    function decodeBase64(s: string): Uint8Array;
  }
}