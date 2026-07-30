import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  projectId: z.string().uuid()
});

export async function POST(request: Request) {
  const payload = requestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid analysis request", details: payload.error.flatten() },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      projectId: payload.data.projectId,
      status: "queued",
      progress: 0
    },
    { status: 202 }
  );
}
