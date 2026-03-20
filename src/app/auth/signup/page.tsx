import { redirect } from 'next/navigation';

// Sign-up is handled on the same page as sign-in (tab toggle)
export default async function SignUpRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  params.set('tab', 'signup');
  for (const [key, value] of Object.entries(resolved)) {
    if (value && key !== 'tab') params.set(key, Array.isArray(value) ? value[0] : value);
  }
  redirect(`/auth/login?${params.toString()}`);
}
