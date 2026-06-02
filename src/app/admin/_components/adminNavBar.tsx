"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"

export default function AdminNavBar() {
	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					redirect("/signin")
				},
			},
		})
	}
	return (
		<nav className='flex items-center justify-between p-8'>
			<div>
				<h1 className='text-2xl font-bold uppercase leading-6'>
					Alejandro Ortigueira
				</h1>
				<h2 className='text-lg uppercase tracking-wide text-muted-foreground leading-6'>
					Panel de administración
				</h2>
			</div>
			<Button onClick={handleLogout}>Cerrar sesión</Button>
		</nav>
	)
}
