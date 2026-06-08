import React, { Suspense } from 'react';
import StoreRegistrationPage from './store-registration';

export default function StoreReviewPage() {
  return (
    <Suspense fallback={<p>Loading store details...</p>}>
      <StoreRegistrationPage />
    </Suspense>
  );
}
