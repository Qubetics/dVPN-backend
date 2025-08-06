import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from '@cosmjs/launchpad'
import { signatureToPubkey } from '@hanchon/signature-to-pubkey'
import { KeplrSignature } from "../interfaces/keplrSignature.interfaces";

const messageToAminoTransaction = (signer: string, data: string) => {
  return {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: [],
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data,
        },
      },
    ],
    memo: '',
  }
};

export const verifyKeplrSignature = (
  address: string,
  pubKey: string,
  message: string,
  signature: KeplrSignature
) => {
  try {
    const aminoEncoded = messageToAminoTransaction(
      address,
      Buffer.from(message).toString("base64")
    );
    const serialized = serializeSignDoc(aminoEncoded);

    const hashed = sha3.keccak_256(arrayify(serialized));

    const signatureToCompare = `0x${Buffer.from(
      signature.signature,
      "base64"
    ).toString("hex")}`;

    const pubkeyComputed = signatureToPubkey(
      signatureToCompare,
      Buffer.from(hashed, "hex")
    );
    return {
      verify: pubkeyComputed === pubKey,
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
