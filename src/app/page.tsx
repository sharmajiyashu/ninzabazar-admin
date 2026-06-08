import { requireAuth } from '@/lib/auth';
import UserManagementPage from './(pages)/user-management/page';

export const dynamic = 'force-dynamic';

export default async function Home() {
	await requireAuth();
	return (
		<div>
			<UserManagementPage />
		</div>
	);
}
