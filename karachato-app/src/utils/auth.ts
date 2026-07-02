export function checkAuth(request: Request): boolean {
  if (!process.env.CRON_SECRET) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}
