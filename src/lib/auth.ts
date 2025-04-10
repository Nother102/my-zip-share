export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const list = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return list.split(",").map(e => e.trim()).includes(email);
}
