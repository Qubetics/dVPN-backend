import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/amino";
import { Secp256k1, ExtendedSecp256k1Signature } from "@cosmjs/crypto";

const messageToAminoTransaction = (signer: string, data: string) => {
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
          signer,
          data,
        },
      },
    ],
    memo: "",
  };
};

export const verifyKeplrSignature = (
  address: string,
  pubKey: string,
  message: string,
  signature: { pub_key: { type: string; value: string }; signature: string }
) => {
  try {
    // Build the Amino sign doc
    const aminoEncoded = messageToAminoTransaction(
      address,
      Buffer.from(message).toString("base64")
    );

    // Serialize the doc
    const serialized = serializeSignDoc(aminoEncoded);

    // Hash with Keccak-256
    const hashed = sha3.keccak_256(arrayify(serialized));

    // Decode base64 signature to raw bytes
    const signatureBytes = Buffer.from(signature.signature, "base64");

    // Parse into ExtendedSecp256k1Signature
    const extSig = ExtendedSecp256k1Signature.fromFixedLength(signatureBytes);

    // Recover public key
    const pubkeyRecovered = Secp256k1.recoverPubkey(
      extSig,
      Buffer.from(hashed, "hex")
    );

    // Convert recovered pubkey to base64
    const pubkeyRecoveredBase64 = Buffer.from(pubkeyRecovered).toString("base64");

    return {
      verify: pubkeyRecoveredBase64 === pubKey,
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
