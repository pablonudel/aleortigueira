"use client"

import { unslugify } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AppSideBar } from "./AppSideBar"
import LetterSwapForward from "./fancy/text/letter-swap-forward-anim"
import InstagramIcon from "./instagram-icon"
import LinkedinIcon from "./linkedin-icon"
import {
	DropdownMenu,
	DropdownMenuContent2,
	DropdownMenuItem2,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { SidebarTrigger } from "./ui/sidebar"
import VimeoIcon from "./vimeo-icon"

function BioLink() {
	const searchParams = useSearchParams()
	const queryString = searchParams.toString()
	const bioPath = queryString ? `?${queryString}#bio` : "#bio"

	return (
		<Link href={bioPath}>
			<LetterSwapForward
				label='bio'
				reverse={false}
				className='text-foreground/50 hover:text-foreground transition-colors'
			/>
		</Link>
	)
}

export function NavBar({
	categories,
	socialNetworkEntries,
}: {
	categories: string[]
	socialNetworkEntries: [string, unknown][]
}) {
	return (
		<nav className='flex items-center justify-between px-4 md:px-8 py-8 md:py-12'>
			<Link href='/'>
				<div className='flex items-center gap-2 md:gap-4'>
					<Image
						src='/logo.svg'
						alt='Logo'
						width={662}
						height={417}
						className='object-cover h-7 md:h-10 w-auto'
					/>
					<div>
						<h1 className='text-[1rem] md:text-2xl font-medium uppercase leading-4.5 md:leading-6 tracking-wide'>
							Alejandro Ortigueira (ADF)
						</h1>
						<h2 className='text-[0.9rem] md:text-xl uppercase tracking-wider text-muted-foreground/70 leading-4.5 md:leading-6'>
							Director de Fotografía
						</h2>
					</div>
				</div>
			</Link>
			<menu className='flex items-center'>
				<ul className='hidden md:flex items-center gap-4 font-medium tracking-wide font-heading uppercase'>
					<li>
						<DropdownMenu>
							<DropdownMenuTrigger className='focus:outline-none'>
								<LetterSwapForward
									label='work'
									reverse={false}
									className='uppercase text-foreground/50 hover:text-foreground transition-colors'
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent2 align='center' sideOffset={16}>
								<Link href='/' replace>
									<DropdownMenuItem2>Todos</DropdownMenuItem2>
								</Link>
								{categories.map((category) => (
									<Link
										key={category}
										href={{
											pathname: "/",
											search: `?category=${category}`,
										}}
										replace>
										<DropdownMenuItem2>{unslugify(category)}</DropdownMenuItem2>
									</Link>
								))}
							</DropdownMenuContent2>
						</DropdownMenu>
					</li>
					<li>
						<Suspense
							fallback={
								<Link href='#bio'>
									<LetterSwapForward
										label='Bio'
										reverse={false}
										className='text-foreground/50 hover:text-foreground transition-colors'
									/>
								</Link>
							}>
							<BioLink />
						</Suspense>
					</li>
					<li>
						<Link href='#contacto'>
							<LetterSwapForward
								label='contacto'
								reverse={false}
								className='text-foreground/50 hover:text-foreground transition-colors'
							/>
						</Link>
					</li>
				</ul>
				{socialNetworkEntries && socialNetworkEntries.length > 0 && (
					<ul className='hidden lg:flex items-center gap-2 ml-8'>
						{socialNetworkEntries.map(([key, value]) => (
							<li
								key={key}
								className='opacity-70 hover:opacity-100 hover:scale-115 transition-all duration-300 ease-in-out'>
								<Link
									href={String(value)}
									target='_blank'
									rel='noopener noreferrer'>
									{key === "Vimeo" ? (
										<VimeoIcon />
									) : key === "Instagram" ? (
										<InstagramIcon />
									) : (
										<LinkedinIcon />
									)}
								</Link>
							</li>
						))}
					</ul>
				)}
				<div className='md:hidden'>
					<Suspense fallback={<div>Loading...</div>}>
						<AppSideBar
							categories={categories}
							socialNetworkEntries={socialNetworkEntries}
						/>
					</Suspense>
				</div>
				<div className='md:hidden'>
					<SidebarTrigger />
				</div>
			</menu>
		</nav>
	)
}
