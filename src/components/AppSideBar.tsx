"use client"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	useSidebar,
} from "@/components/ui/sidebar"
import { unslugify } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion"

function BioLink() {
	const { setOpenMobile } = useSidebar()
	const searchParams = useSearchParams()
	const queryString = searchParams.toString()
	const bioPath = queryString ? `?${queryString}#bio` : "/#bio"

	return (
		<Link href={bioPath} onClick={() => setOpenMobile(false)} replace>
			Bio
		</Link>
	)
}

export function AppSideBar({ categories }: { categories: string[] }) {
	const { setOpenMobile } = useSidebar()

	return (
		<Sidebar variant='sidebar'>
			<SidebarHeader className='pt-8'>
				<Image
					src='/ao.svg'
					alt='Logo'
					width={662}
					height={417}
					className='h-12'
				/>
			</SidebarHeader>
			<SidebarContent className='justify-center'>
				<SidebarGroup className='flex flex-col gap-4 text-4xl font-sans font-light text-center'>
					<Accordion type='single' collapsible>
						<AccordionItem value='work'>
							<AccordionTrigger className='justify-center text-4xl font-sans font-light'>
								Work
							</AccordionTrigger>
							<AccordionContent className='flex flex-col gap-2 h-fit text-center pt-4'>
								<Link
									href='/'
									onClick={() => setOpenMobile(false)}
									style={{ textDecoration: "none" }}
									className='text-2xl'
									replace>
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
										style={{ textDecoration: "none" }}
										className='text-2xl'
										replace>
										{unslugify(category)}
									</Link>
								))}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
					<Suspense fallback={<Link href='/#bio'>Bio</Link>}>
						<BioLink />
					</Suspense>
					<Link href='#contacto' onClick={() => setOpenMobile(false)} replace>
						Contacto
					</Link>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className='pb-8'>Hola</SidebarFooter>
		</Sidebar>
	)
}
