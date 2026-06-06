import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { DashboardShell } from '@/components/DashboardShell';
import QueryProvider from './providers/query-provider';
import SessionWrapper from './providers/session-provider';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Admin | Ninja Bazaar',
	description: 'Admin Dashboard for NB',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={geist.className}>
				<SessionWrapper>
					<QueryProvider>
						<DashboardShell>
							{children}
						</DashboardShell>
					</QueryProvider>
				</SessionWrapper>
			</body>
		</html>
	);
}
