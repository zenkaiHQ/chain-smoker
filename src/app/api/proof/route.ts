import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { jwt, publicKey, maxEpoch, salt } = await request.json();
  const response = await fetch(process.env.SUI_PROVER_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey: publicKey,
      maxEpoch,
      jwtRandomness: "100000000000000000000000000000000",
      salt,
      keyClaimName: "sub",
    }),
  });
  const proof = await response.json();
  return NextResponse.json(proof);
}
