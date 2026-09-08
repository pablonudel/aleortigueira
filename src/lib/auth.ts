import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"
import prisma from "./prisma"

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		minPasswordLength: 6,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	plugins: [username(), nextCookies()],
})
