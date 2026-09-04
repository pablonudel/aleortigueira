import { getAllCategories } from "@/actions/category.actions"
import { slugify } from "@/lib/utils"
import "react-photo-view/dist/react-photo-view.css"

import { getProfile } from "@/actions/profile.actions"
import ContactSection from "@/components/contactSection"
import { NavBar } from "@/components/navBar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function Layout({
	children,
}: {
	children: React.ReactNode
}) {
	"use cache"
	const { data } = await getAllCategories()
	const profile = await getProfile()

	const socialNetworkEntries =
		profile.data?.socialNetworks &&
		typeof profile.data.socialNetworks === "object" &&
		!Array.isArray(profile.data.socialNetworks)
			? Object.entries(profile.data.socialNetworks as Record<string, unknown>)
			: []

	const categories = data
		.filter((category) =>
			category.projects?.some((project) => project.isPublic),
		)
		.map((category) => slugify(category.name))

	return (
		<SidebarProvider defaultOpen={false}>
			<div className='flex flex-1 flex-col min-h-screen'>
				<NavBar
					categories={categories}
					socialNetworkEntries={socialNetworkEntries}
				/>
				{children}
				<ContactSection profile={profile} />
			</div>
		</SidebarProvider>
	)
}
