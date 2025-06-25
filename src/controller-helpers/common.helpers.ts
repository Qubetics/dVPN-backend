import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from '@cosmjs/launchpad'
import { signatureToPubkey } from '@hanchon/signature-to-pubkey'
import { KeplrSignature } from "../interfaces/keplrSignature.interfaces";


function messageToAminoTransaction(signer: string, data: string) {
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
}

export const verifyKeplrSignature = (
  address: string,
  pubKey: string,
  message: string,
  signature: KeplrSignature
) => {
// Encode the message into amino format
try{
const aminoEncoded = messageToAminoTransaction(
  address,
  Buffer.from(message).toString("base64")
);
const serialized = serializeSignDoc(aminoEncoded);

// Hash the amino message that was signed
const hashed = sha3.keccak_256(arrayify(serialized));

// Compare signature
const signatureToCompare = `0x${Buffer.from(
  signature.signature,
  "base64"
).toString("hex")}`;
console.log(hashed);
const pubkeyComputed = signatureToPubkey(
  signatureToCompare,
  Buffer.from(hashed, "hex")
);
// console.log(pubkeyComputed===pubKey, pubkeyComputed, pubKey )
return {
  verify: pubkeyComputed === pubKey,
};
} catch (e){
  return {
    verify: false,
  };
}
};
