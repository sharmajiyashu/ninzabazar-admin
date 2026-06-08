import { redirectIfAuthenticated } from '@/lib/auth';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
