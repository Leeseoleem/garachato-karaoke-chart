export function checkAuth(request: Request): boolean {
  if (!process.env.CRON_SECRET) return true;
  return (
    request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}
