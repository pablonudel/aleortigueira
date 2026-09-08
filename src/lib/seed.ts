import "dotenv/config"
import { auth } from "./auth"
import prisma from "./prisma"

async function seed() {
	try {
		// const existingUser = await prisma.user.findUnique({
		// 	where: { email: process.env.ADMIN_EMAIL },
		// })

		// if (existingUser) {
		// 	console.log("User already registered:", existingUser)
		// 	process.exit(0)
		// }

		const users = await prisma.user.findMany()

		if (users.length === 0) {
			await auth.api.signUpEmail({
				body: {
					name: process.env.ADMIN_NAME || "Admin",
					email: process.env.ADMIN_EMAIL || "admin@example.com",
					username: process.env.ADMIN_USERNAME || "admin",
					password: process.env.ADMIN_PASSWORD || "admin",
				},
			})
		}
		process.exit(0)
	} catch (error) {
		console.log("Sign up failed:", error)
		process.exit(1)
	}
}

seed()
