import React from 'react';
import { Suspense } from 'react';
import StoreRegistrationPage from '@/app/(pages)/store-registration/store-registration';
const page = () => {
	return (
		<div>
			<Suspense fallback={<p>Loading Store...</p>}>
				<StoreRegistrationPage />
			</Suspense>
		</div>
	);
};

export default page;
