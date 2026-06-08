import { redirectIfAuthenticated } from '@/lib/auth';
import SignInForm from './sign-in-form';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  await redirectIfAuthenticated();
  return <SignInForm />;
}
