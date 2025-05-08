"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import {
  createEphemeralKeypair,
  computeZkLoginAddress,
  signZkLoginTransaction,
} from "@/lib/zkLogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const jwt = searchParams.get("jwt");
  const [address, setAddress] = useState("");
  const [salt, setSalt] = useState("");
  const [proof, setProof] = useState<any>(null);
  const [client] = useState(
    new SuiClient({ url: "https://fullnode.testnet.sui.io" })
  );

  useEffect(() => {
    if (jwt) {
      const fetchSaltAndProof = async () => {
        const saltResponse = await fetch("/api/salt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwt }),
        });
        const { salt } = await saltResponse.json();
        setSalt(salt);

        const { publicKey } = createEphemeralKeypair();
        const proofResponse = await fetch("/api/proof", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jwt,
            publicKey: publicKey.toBase64(),
            maxEpoch: 10,
            salt,
          }),
        });
        const proofData = await proofResponse.json();
        setProof(proofData);
        const zkLoginAddress = computeZkLoginAddress(jwt, salt);
        setAddress(zkLoginAddress);
      };
      fetchSaltAndProof();
    }
  }, [jwt]);

  const handleTransaction = async () => {
    const tx = new Transaction();
    // Example: Add transaction operations here

    const { privateKey } = createEphemeralKeypair();
    const signedBytes = await new Ed25519Keypair().sign(
      new TextEncoder().encode(tx.serialize())
    );
    const userSignature = Buffer.from(signedBytes).toString("base64");
    const zkLoginSignature = await signZkLoginTransaction({
      tx,
      jwt: jwt!,
      proof,
      userSalt: salt,
      maxEpoch: 10,
      userSignature,
    });

    const result = await client.executeTransactionBlock({
      transactionBlock: tx.serialize(),
      signature: [zkLoginSignature],
    });
    console.log("Transaction Result:", result);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl">zkLogin Dashboard</h1>
      <p>Address: {address}</p>
      <button
        onClick={handleTransaction}
        className="mt-4 rounded bg-green-500 px-4 py-2 text-white"
      >
        Execute Transaction
      </button>
    </div>
  );
}
