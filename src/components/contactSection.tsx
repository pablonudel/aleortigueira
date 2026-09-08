import { getProfile } from "@/actions/profile.actions"
import { DatabaseX, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import CenterUnderline from "./fancy/text/underline-center"
import InstagramIcon from "./instagram-icon"
import LinkedinIcon from "./linkedin-icon"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty"
import VimeoIcon from "./vimeo-icon"

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
		<div
			id='contacto'
			className='flex flex-col lg:flex-row items-start gap-8 bg-foreground/3 px-4 md:px-8 py-10'>
			<div className='lg:w-1/3 flex items-center gap-2 lg:x-1/3'>
				<Image
					src='/logo.svg'
					alt='Logo'
					width={662}
					height={417}
					className='object-cover h-7 w-auto'
				/>
				<div>
					<h1 className='text-[1rem] font-medium uppercase leading-4.5 tracking-wide'>
						Alejandro Ortigueira (ADF)
					</h1>
					<h2 className='text-[0.9rem] uppercase tracking-wider text-muted-foreground leading-4.5'>
						Director de Fotografía
					</h2>
				</div>
			</div>

			<div className='lg:w-1/3 lg:flex lg:justify-center'>
				<div className='flex flex-col gap-4'>
					<div className='lg:text-center'>
						{phoneEntries.map(([key, value]) => (
							<p key={key} className='font-medium'>
								<span className='font-normal'>{key} | </span> {String(value)}
							</p>
						))}
					</div>
					<Link
						href={`mailto:${email}`}
						className='flex items-center gap-2 font-medium'>
						<Mail size={20} color='#999999' strokeWidth='2' />
						<CenterUnderline>{email}</CenterUnderline>
					</Link>
				</div>
			</div>
			<div className='lg:w-1/3 flex lg:justify-end lg:items-center-safe gap-4'>
				{socialNetworkEntries.map(([key, value]) => (
					<Link
						key={key}
						href={String(value)}
						target='_blank'
						rel='noopener noreferrer'
						className='scale-100 hover:scale-110 transition-all duration-300 ease-in-out'>
						{key === "Vimeo" ? (
							<VimeoIcon size={30} />
						) : key === "Instagram" ? (
							<InstagramIcon size={30} />
						) : (
							<LinkedinIcon size={30} />
						)}
					</Link>
				))}
			</div>
		</div>
	)
}
