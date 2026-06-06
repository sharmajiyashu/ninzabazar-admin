import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import readline from 'readline';

// Create input interface
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
	console.log('👤 Create New Admin');

	const username = await askQuestion('Enter username: ');
	const password = await askQuestion('Enter password: ');

	if (!username || !password) {
		console.log('❌ Username and password are required.');
		rl.close();
		return;
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const admin = await prisma.admin.create({
		data: {
			username,
			password: hashedPassword,
		},
	});

	rl.close();

	const { password: _, ...adminWithoutPassword } = admin;
	console.log('✅ Admin created successfully:', adminWithoutPassword);
}

main()
	.catch((e) => {
		console.error('❌ Error creating admin:', e);
		rl.close();
	})
	.finally(() => {
		prisma.$disconnect();
	});
