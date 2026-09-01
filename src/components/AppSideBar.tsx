"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	useSidebar,
} from "@/components/ui/sidebar"
import { unslugify } from "@/lib/utils"
import Link from "next/link"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion"

export function AppSideBar({ categories }: { categories: string[] }) {
	const mainURL = process.env.MAIN_URL || "http://localhost:3000"

	const { setOpenMobile } = useSidebar()

	return (
		<Sidebar variant='sidebar'>
			<SidebarHeader>Hola</SidebarHeader>
			<SidebarContent className='justify-center'>
				<SidebarGroup className='flex flex-col gap-2 text-center'>
					<Accordion type='single' collapsible>
						<AccordionItem value='work'>
							<AccordionTrigger className='justify-center'>
								Work
							</AccordionTrigger>
							<AccordionContent className='flex flex-col gap-2 h-fit text-center'>
								<Link href='/' onClick={() => setOpenMobile(false)} replace>
									Todos
								</Link>
								{categories.map((category) => (
									<Link
										key={category}
										href={{
											pathname: "/",
											search: `?category=${category}`,
										}}
										onClick={() => setOpenMobile(false)}
										replace>
										{unslugify(category)}
									</Link>
								))}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<Link
						href={`${mainURL}/#bio`}
						onClick={() => setOpenMobile(false)}
						replace>
						Bio
					</Link>
					<Link href='#contacto' onClick={() => setOpenMobile(false)} replace>
						Contacto
					</Link>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
