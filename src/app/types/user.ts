export enum UserRole {
	BUYER = 'BUYER',
	SELLER = 'SELLER',
}

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	SUSPENDED = 'SUSPENDED',
	BANNED = 'BANNED',
}

export interface User {
	id: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffix: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	contactNumber: string;
	profilePicture: string;
	dateOfBirth: string;
	createdAt: string;
	updatedAt: string;
	SellerProfile?: {
		id: string;
		userId: string;
		companyName: string;
		description: string;
		createdAt: string;
		updatedAt: string;
		isVerified: boolean;
		businessDocumentFile?: string;
		businessDocumentType?: string;
		businessEmail?: string;
		businessPhoneNumber?: string;
		businessRegisteredName?: string;
		businessType?: string;
		individualRegisteredName?: string;
		shopName?: string;
		returnsTerms?: string;
		shippingTerms?: string;
		sellerEmail?: string;
		sellerPhoneNumber?: string;
		Address?: Address;
		PickupAddress?: PickupAddress;
		StoreRatingSummary?: {
			id: string;
			sellerId: string;
			average: number;
			totalCount: number;
		};
		reviews: Array<{
			id: string;
			rating: number;
		}>;
		Product: Array<{
			id: string;
			name: string;
			images: Array<{
				urlpath: string;
				isDefault: boolean;
			}>;
			basePrice: number;
			isSale: boolean;
			salePrice?: number;
			reviews: Array<{ rating: number }>;
		}>;
		businessEntities?: BusinessEntityData[];
	};
	BuyerProfile?: {
		id: string;
		userId: string;
		createdAt: string;
		updatedAt: string;
		Address: Array<Address>;
	};
}

export interface Address {
	id: string;
	isDefault: boolean;
	sellerId: string;
	street: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	createdAt: string;
	updatedAt: string;
}

export interface PickupAddress {
	id: string;
	sellerId: string;
	street: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	createdAt: string;
	updatedAt: string;
}

export type BusinessEntityData = SoleProprietorshipProps | CorporationProps;

export interface SoleProprietorshipProps {
	id: number;
	businessType: 'solePropriator';
	businessRegisteredName: string;
	individualRegisteredName: string;
	registeredAddress: string;
	businessDocumentType: string;
	businessDocumentFile: string;
	businessEmail: string;
	businessPhoneNumber: string;
	companyRegisteredName: string;
}

export interface CorporationProps {
	id: number;
	businessType: 'corporation';
	businessRegisteredName: string;
	registeredAddress: string;
	businessDocumentType: string;
	businessDocumentFile: string;
	businessEmail: string;
	businessPhoneNumber: string;
	companyRegisteredName: string;
}
