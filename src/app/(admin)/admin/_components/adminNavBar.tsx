"use client"

import { profileType } from "@/actions/profile.actions"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"
import ProfileForm from "./profileForm"

export default function AdminNavBar({ profile }: { profile: profileType }) {
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
		<nav className='flex items-center justify-between p-8 border-b border-muted-foreground/10'>
			<div>
				<h1 className='text-2xl font-bold uppercase leading-6'>
					Alejandro Ortigueira
				</h1>
				<h2 className='text-lg uppercase tracking-wide text-muted-foreground leading-6'>
					Panel de administración
				</h2>
			</div>
			<div className='space-x-4'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline'>Perfil</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem asChild>
							<ProfileForm profile={profile} />
						</DropdownMenuItem>

						<DropdownMenuItem>Editar Credenciales</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button onClick={handleLogout}>Cerrar sesión</Button>
			</div>
		</nav>
	)
}
