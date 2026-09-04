import { getProfile } from "@/actions/profile.actions"
import { DatabaseX } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty"

export default async function ContactSection({
	profile,
}: {
	profile: Awaited<ReturnType<typeof getProfile>>
}) {
	"use cache"

	const { success, data } = profile

	if (!success || !data) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<DatabaseX />
					</EmptyTitle>
					<EmptyDescription>
						Se ha producido un error al cargar la información de contacto.
						Inténtalo de nuevo más tarde.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	const { email, phones, socialNetworks } = data
	const phoneEntries =
		phones && typeof phones === "object" && !Array.isArray(phones)
			? Object.entries(phones as Record<string, unknown>)
			: []
	const socialNetworkEntries =
		socialNetworks &&
		typeof socialNetworks === "object" &&
		!Array.isArray(socialNetworks)
			? Object.entries(socialNetworks as Record<string, unknown>)
			: []

	return (
		<div id='contacto' className='bg-foreground/3 p-8'>
			{email}
			{phoneEntries.map(([key, value]) => (
				<div key={key}>
					{key}: {String(value)}
				</div>
			))}
			{socialNetworkEntries.map(([key, value]) => (
				<div key={key}>
					{key}: {String(value)}
				</div>
			))}
		</div>
	)
}
