import { getProfile, profileType } from "@/actions/profile.actions"
import { Spinner } from "@/components/ui/spinner"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import AdminNavBar from "./_components/adminNavBar"

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<Suspense
			fallback={
				<div className='flex items-center justify-center h-full'>
					<Spinner className='size-8' />
				</div>
			}>
			<LayoutPage>{children}</LayoutPage>
		</Suspense>
	)
}

async function LayoutPage({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})
	if (!session) {
		redirect("/signin")
	}

	const profile = (await getProfile()) as profileType

	return (
		<>
			<AdminNavBar profile={profile} />
			{children}
		</>
	)
}
