import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import SigninForm from "./_components/signinForm"

export default function Page() {
	return (
		<Suspense fallback={<div>Cargando...</div>}>
			<Signin />
		</Suspense>
	)
}

async function Signin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	if (session) {
		redirect("/admin")
	}
	return (
		<div className='flex h-dvh items-center justify-center'>
			<SigninForm />
		</div>
	)
}
