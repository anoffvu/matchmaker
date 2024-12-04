import { createUser } from "@/lib/actions/users";

// export const runtime = "edge";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { name, bio } = body;

    const res = await createUser({ name, bio });

    return Response.json({
      message: "User bio saved successfully",
      success: true,
    });
  } catch (error) {
    console.error("Full error:", error); // This logs to Vercel's error tracking
    console.log(
      JSON.stringify({
        requestId,
        type: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          error instanceof Error
            ? error.stack?.slice(0, 500) + "..."
            : "No stack available",
        duration: Date.now() - startTime,
      })
    );
    return Response.json(
      { error: "Error processing request", success: false },
      { status: 500 }
    );
  }
}
