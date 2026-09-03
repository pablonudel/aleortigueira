"use client"

import { unslugify } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppSideBar } from "./AppSideBar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { SidebarTrigger } from "./ui/sidebar"

function BioLink() {
	const searchParams = useSearchParams()
	const queryString = searchParams.toString()
	const bioPath = queryString ? `?${queryString}#bio` : "/#bio"

	return (
		<Link href={bioPath} replace>
			Bio
		</Link>
	)
}

export function NavBar({ categories }: { categories: string[] }) {
	return (
		<nav className='flex items-center justify-between px-6 py-8 md:p-8'>
			<Link href='/' replace>
				<div className='flex items-center gap-2 md:gap-4'>
					<Image
						src='/ao.svg'
						alt='Logo'
						width={662}
						height={417}
						className='object-cover h-8 md:h-10 w-auto'
					/>
					<div>
						<h1 className='text-[1.1rem] md:text-2xl font-bold uppercase leading-5 md:leading-6'>
							Alejandro Ortigueira (ADF)
						</h1>
						<h2 className='text-[1rem] md:text-xl uppercase tracking-wide text-muted-foreground leading-5 md:leading-6'>
							Director de Fotografía
						</h2>
					</div>
				</div>
			</Link>
			<menu>
				<ul className='hidden md:flex items-center gap-4 text-lg'>
					<li>
						<DropdownMenu>
							<DropdownMenuTrigger className='focus:outline-none'>
								Work
							</DropdownMenuTrigger>
							<DropdownMenuContent align='center' sideOffset={16}>
								<Link href='/' replace>
									<DropdownMenuItem>Todos</DropdownMenuItem>
								</Link>
								{categories.map((category) => (
									<Link
										key={category}
										href={{
											pathname: "/",
											search: `?category=${category}`,
										}}
										replace>
										<DropdownMenuItem>{unslugify(category)}</DropdownMenuItem>
									</Link>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					<li>
						<Suspense fallback={<Link href='/#bio'>Bio</Link>}>
							<BioLink />
						</Suspense>
					</li>
					<li>
						<Link href='#contacto' replace>
							Contacto
						</Link>
					</li>
				</ul>
				<div className='md:hidden'>
					<Suspense fallback={<div>Loading...</div>}>
						<AppSideBar categories={categories} />
					</Suspense>
					<SidebarTrigger />
				</div>
			</menu>
		</nav>
	)
}
