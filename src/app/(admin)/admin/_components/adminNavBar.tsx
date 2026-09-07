"use client"

import { profileType } from "@/actions/profile.actions"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
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
		<nav className='flex items-center text-white justify-between p-8 bg-foreground'>
			<div>
				<h1 className='text-2xl font-bold uppercase leading-6'>
					Alejandro Ortigueira
				</h1>
				<h2 className='text-lg uppercase tracking-wide text-muted-foreground leading-6'>
					Panel de administración
				</h2>
			</div>
			<div className='flex gap-4 items-center'>
				<ProfileForm profile={profile} />
				<Button onClick={handleLogout} size='icon' variant='outline'>
					<LogOut />
				</Button>
			</div>
		</nav>
	)
}
