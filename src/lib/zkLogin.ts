import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import {
  generateNonce,
  jwtToAddress,
  getZkLoginSignature,
  generateRandomness,
} from "@mysten/sui/zklogin";
import { Transaction } from "@mysten/sui/transactions";

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export function createEphemeralKeypair() {
  const keypair = new Ed25519Keypair();
  return {
    publicKey: keypair.getPublicKey(),
    privateKey: keypair.getSecretKey(),
  };
}

export function generateGoogleLoginUrl(
  clientId: string,
  redirectUri: string,
  maxEpoch: number,
  publicKey: Ed25519PublicKey
) {
  const randomness = generateRandomness();
  console.log("randomness", randomness);
  console.log("publicKey", publicKey);
  const nonce = generateNonce(publicKey, maxEpoch, randomness);
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid%20email&nonce=${nonce}`;
}

export async function signZkLoginTransaction({
  tx,
  jwt,
  proof,
  userSalt,
  maxEpoch,
  userSignature,
}: {
  tx: Transaction;
  jwt: string;
  proof: any;
  userSalt: string;
  maxEpoch: number;
  userSignature: string;
}) {
  const zkLoginSignature = getZkLoginSignature({
    inputs: proof,
    maxEpoch,
    userSignature,
  });
  return zkLoginSignature;
}

export function computeZkLoginAddress(jwt: string, userSalt: string) {
  return jwtToAddress(jwt, userSalt);
}
