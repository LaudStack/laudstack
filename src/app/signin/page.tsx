import { redirect } from 'next/navigation';

// Redirect /signin to /auth/login for backward compatibility
export default async function SignInRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (value) params.set(key, Array.isArray(value) ? value[0] : value);
  }
  const qs = params.toString();
  redirect(`/auth/login${qs ? `?${qs}` : ''}`);
}
