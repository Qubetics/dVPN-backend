import axios from 'axios';
import sha3 from "js-sha3";
const { bech32 } = require("bech32");
import { serializeSignDoc } from "@cosmjs/amino";
import { Secp256k1, Secp256k1Signature } from "@cosmjs/crypto";
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
import { fromBase64 } from "@cosmjs/encoding";

export const createSignDoc = (address: string, message: string) => {
  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: {
      gas: "0",
      amount: [],
    },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: {
          signer: address,
          data: Buffer.from(message).toString("base64"),
        },
      },
    ],
    memo: "",
  };
};

export const verifyKeplrSignature = async (
  address: string,
  message: string,
  signature: { pub_key: { type: string; value: string }; signature: string }
) => {
  try {
    const decoded = bech32.decode(address);
    const bech32Prefix = decoded.prefix;

    const pubKeyBytes = fromBase64(signature?.pub_key?.value);
    const signatureBytes = fromBase64(signature?.signature);

    const signDoc = createSignDoc(address, message);

    const serialized = serializeSignDoc(signDoc);
    const messageKeccakHash = sha3.keccak_256(serialized);
    const messageHash = Buffer.from(messageKeccakHash, "hex");

    const signatureObject = Secp256k1Signature.fromFixedLength(signatureBytes);
    const isValidSignature = await Secp256k1.verifySignature(
      signatureObject,
      messageHash,
      pubKeyBytes
    );

    if (!isValidSignature) {
      console.error("Signature verification failed");
      return { verify: false };
    }

    const key = ec.keyFromPublic(pubKeyBytes);
    const uncompressed = key.getPublic(false, "hex");
    const uncompressedNoPrefix = uncompressed.slice(2);
    const uncompressedBytes = Buffer.from(uncompressedNoPrefix, "hex");

    const keccakHash = sha3.keccak_256(uncompressedBytes);
    const addressBytes = Buffer.from(keccakHash, "hex").slice(-20);

    const words = bech32.toWords(addressBytes);
    const derivedAddress = bech32.encode(bech32Prefix, words);
    return {
      verify: derivedAddress === address,
    };
  } catch (e) {
    return {
      verify: false,
    };
  }
};

export function flattenNodeFields(results: any[]): any[] {
  return results.map((row: any) => {
    const flatRow: any = {};

    for (const key in row) {
      if (key.startsWith("node.")) {
        const cleanKey = key.replace("node.", "");
        flatRow[cleanKey] = row[key];
      } else {
        flatRow[key] = row[key];
      }
    }

    return flatRow;
  });
};

export function TOKEN_PRICE_KEY(symbol: string, currency: string) {
  return `token_price:${symbol.toUpperCase()}:${currency.toLowerCase()}`;
};

export async function getCurrentTokenPrice(API_URL:string,END_POINT:string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${API_URL}${END_POINT}`);

    return data?.data?.current_token_price ?? null;
  } catch (error) {
    console.error('Token price fetch error:', error);
    return null;
  }
}