export interface Store {
	id: string;
	userId: string;
	storeName: string;
	owner: string;
	businessType: string;
	businessEmail: string;
	country: string;
	storeStatus:
		| 'waiting submission'
		| 'pending'
		| 'under review'
		| 'approved'
		| 'rejected';
	email: string;
	businessAddress: string;
	pickupAddress: string;
	businessRegisteredName: string;
	individualRegisteredName: string;
	returnPolicy: string;
	shippingPolicy: string;
	contactEmail: string;
	contactPhone: string;
	businessDocumentFile?: string | null;
	businessPhoneNumber: string;
}

export interface ActionDropdownProps {
	store: Store;
	onUpdateStatus: (
		storeId: string,
		newStatus: Store['storeStatus'],
		verified: boolean
	) => void;
}
