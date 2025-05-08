import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { jwt } = await request.json();
  const response = await fetch(`${process.env.SUI_SALT_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: jwt,
    }),
  });
  console.log("Response from SUI_SALT_URL:", response);
  const data = await response.json();
  return NextResponse.json({ salt: data.salt });
}
