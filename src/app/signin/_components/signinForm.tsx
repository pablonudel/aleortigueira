"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
	username: z
		.string()
		.min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
	password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export default function SigninForm() {
	const router = useRouter()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	})

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const username = data.username
		const password = data.password
		try {
			const { error } = await authClient.signIn.username({
				username,
				password,
			})
			if (error) {
				toast.error(error.message)
			} else {
				form.reset()
				router.push("/admin")
			}
		} catch (error) {
			console.error("Error signing in:", error)
			toast.error("Error on signing in. Please try again.")
		}
	}

	return (
		<Card className='w-1/4 min-w-80'>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					<Controller
						name='username'
						control={form.control}
						render={({ field, fieldState }) => (
							<div>
								<Input {...field} placeholder='Usuario' />
								{fieldState.error && (
									<p className='text-sm text-destructive'>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>
					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<div>
								<Input {...field} type='password' placeholder='Contraseña' />
								{fieldState.error && (
									<p className='text-sm text-destructive'>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>
					<Button type='submit' className='w-full font-bold'>
						Iniciar sesión
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
