import { processPendingYoutube } from "@/lib/youtube/process";
import { checkAuth } from "@/utils/auth";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await processPendingYoutube();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
