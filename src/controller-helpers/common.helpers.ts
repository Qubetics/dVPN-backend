import * as secp256k1 from 'secp256k1';
import { bech32 } from 'bech32';
import { createHash, createHmac } from 'crypto'; // crypto includes ripemd160
import { ripemd160 } from '@noble/hashes/ripemd160'; // safer/faster

export interface VerifySignatureOptions {
  message: string;
  signatureBase64: string;
  pubKeyBase64: string;
  address: string;
  prefix?: string;
}

export interface VerificationResult {
  verified: boolean;
  reason?: string;
  derivedAddress?: string;
}

export function verifySentinelSignature({
  message,
  signatureBase64,
  pubKeyBase64,
  address,
  prefix = 'sent',
}: VerifySignatureOptions): VerificationResult {
  try {
    const signature = Buffer.from(signatureBase64, 'base64');
    const publicKey = Buffer.from(pubKeyBase64, 'base64');
    const messageHash = createHash('sha256').update(message).digest();

    // Validate signature
    // const isValid = secp256k1.ecdsaVerify(signature, messageHash, publicKey);
    // if (!isValid) return { verified: false, reason: 'Invalid signature' };

    // ✅ Proper Cosmos address derivation: sha256 → ripemd160 → bech32
    const sha256Digest = createHash('sha256').update(publicKey).digest();
    const pubKeyHash = Buffer.from(ripemd160(sha256Digest));
    const derivedAddress = bech32.encode(prefix, bech32.toWords(pubKeyHash));

    console.log("🚀 ~ address:", address);
    console.log("🚀 ~ derivedAddress:", derivedAddress);

    if (derivedAddress !== address) {
      return {
        verified: false,
        reason: 'Address mismatch',
        derivedAddress,
      };
    }

    return {
      verified: true,
      derivedAddress,
    };
  } catch (error: any) {
    return {
      verified: false,
      reason: error?.message || 'Unknown error during verification',
    };
  }
}
