export interface EscrowPageProps {
	transactionId: string;
	buyer: string;
	seller: string;
	paymentMethod: string;
	status: string;
	amount: number;
}

export interface CurrencyFormatterProps {
	amount: number;
	currency?: string;
	locale?: string;
	minimumFractionDigits?: number;
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

export interface SellerProfile {
	id: string;
	userId: string;
	companyName: string;
	createdAt: string;
	updatedAt: string;
	isVerified: boolean;
	businessDocumentFile?: string | null;
	businessDocumentType?: string | null;
	businessEmail?: string | null;
	businessPhoneNumber?: string | null;
	businessRegisteredName?: string | null;
	businessType?: string | null;
	individualRegisteredName?: string | null;
	shopName?: string | null;
	returnsTerms?: string | null;
	sellerEmail?: string | null;
	sellerPhoneNumber?: string | null;
	shippingTerms?: string | null;
	description?: string | null;
	registeredAddress?: Address | null;
	pickupAddress?: PickupAddress | null;
	storeRatingSummary?: {
		id: string;
		sellerId: string;
		average: number;
		totalCount: number;
		updatedAt: string;
	};

	CartItem: CartItem[];
	OrderItem: OrderItem[];
	products: ProductDataProps[];

	reviews?: Array<{
		id: string;
		rating: number;
	}>;
	businessEntities?: BusinessEntityData[];

	user: User;
}

export interface ProductDataProps {
	id: string;
	name: string;
	description: string;
	sellerId: string;
	createdAt: string;
	updatedAt: string;
	basePrice: number;
	category: string;
	isSale: boolean;
	isActive: boolean;
	salePrice?: number;
	keywords: string[];
	totalPurchases: number;
	images: Array<{
		urlpath: string;
		isDefault: boolean;
		alt?: string;
	}>;
	seller: {
		id: string;
		userId: string;
		companyName: string;
		createdAt: string;
		storeRatingSummary: {
			id: string;
			sellerId: string;
			average: number;
			totalCount: number;
			updatedAt: string;
		};
	};
	status: string;
	reviews: Array<{
		id: string;
		rating: number;
	}>;
	quantity: number;
	variantCombination?: string[];
	variants: ProductVariant[];
	shippingMethods: ShippingMethod[];
}

export interface ShippingMethod {
	id: string;
	name: string;
	price: number;
	estimatedDays: string;
	description: string;
	isActive: boolean;
}

export interface ProductVariant {
	id: string;
	title: string;
	option: string;
	hasPrice?: boolean;
	price?: number;
}

export interface CartItem {
	id: string;
	buyerId: string;
	productId: string;
	name: string;
	variantId?: string;
	quantity: number;
	isSale: boolean;
	salePrice: number;
	basePrice: number;
	seller: {
		id: string;
		userId: string;
		companyName: string;
		createdAt: string;
		storeRatingSummary: {
			id: string;
			sellerId: string;
			average: number;
			totalCount: number;
			updatedAt: string;
		};
	};
	images: string;
	product?: {
		seller: {
			id: string;
		};
		shippingMethods: ShippingMethod[];
	};
	variantCombination: string[]; // Array of variant IDs
	variants: ProductVariant[];
}

export interface OrderItem {
	id: string;
	quantity: number;
	priceAtPurchase: string;
	shippingMethodPrice?: number;
	SellerProfile: SellerProfile;
	Product?: {
		id: string;
		name: string;
		description: string;
		basePrice: number;
		isSale: boolean;
		salePrice?: number;
		ProductImage?: Array<{
			urlpath: string;
			isDefault: boolean;
			alt?: string;
		}>;
		SellerProfile?: {
			id: string;
			userId: string;
			companyName: string;
			shopName?: string;
			businessEmail?: string;
			businessPhoneNumber?: string;
			isVerified: boolean;
			Address?: {
				street: string;
				city: string;
				state: string;
				postalCode: string;
				country: string;
			};
			StoreRatingSummary?: {
				average: number;
				totalCount: number;
			};
		};
	};
	variant?: {
		id: string;
		title: string;
		option: string;
		price: string;
	};
}
export interface Order {
	id: string;
	status: string;
	createdAt: string;
	totalAmount: string;
	paymentId?: string;
	razorpayOrderId?: string;
	trackingLink?: string;
	BuyerProfile: {
		User: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			contactNumber: string;
		};
	};
	OrderItem: OrderItem[];
	EscrowPayment?: {
		id: string;
		status: string;
		amount: string;
		razorpayPaymentId?: string;
		createdAt: string;
		releaseDate?: string;
	} | null;
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

export enum UserRole {
	BUYER = 'BUYER',
	SELLER = 'SELLER',
}

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	SUSPENDED = 'SUSPENDED',
	BANNED = 'BANNED',
}
