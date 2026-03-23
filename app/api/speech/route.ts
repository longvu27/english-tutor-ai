import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const buffer = await file.arrayBuffer();

  const res = await fetch("https://api.deepgram.com/v1/listen", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm",
    },
    body: buffer,
  });

  const data = await res.json();

  const text =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

  return NextResponse.json({ text });
}