export function checkAuth(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}
