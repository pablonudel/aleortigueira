import { getProfile } from "@/actions/profile.actions"
import { DatabaseX } from "lucide-react"
import Image from "next/image"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty"

const imageBaseURL = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/profile`

export default async function BioSection() {
	"use cache"

	const { success, data } = await getProfile()

	if (!success || !data) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<DatabaseX />
					</EmptyTitle>
					<EmptyDescription>
						Se ha producido un error al cargar la biografía. Inténtalo de nuevo
						más tarde.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	const { image, bio } = data

	return (
		<div
			id='bio'
			className='flex flex-col lg:flex-row lg:max-w-11/12 mx-auto mb-16'>
			<div className='w-full px-4 md:px-8 lg:px-0 lg:py-8 bio-gradient'>
				<Image
					src={`${imageBaseURL}/${image}`}
					alt='Profile Image'
					width={960}
					height={536}
					className='w-full md:aspect-auto md:h-90 lg:h-full object-cover'
				/>
			</div>
			<div className='flex w-full px-4 md:px-8 pt-6 lg:pt-8 pb-8 bio-text-gradient'>
				<div className='self-center'>
					<h2 className='text-3xl mb-4 font-medium uppercase'>Bio</h2>
					<p className='whitespace-pre-line'>{bio}</p>
				</div>
			</div>
		</div>
	)
}
