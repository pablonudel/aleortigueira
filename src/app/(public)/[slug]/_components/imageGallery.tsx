"use client"
import Image from "next/image"
import { PhotoProvider, PhotoView } from "react-photo-view"

export default function ImageGallery({
	gallery,
	projectId,
}: {
	gallery: string[]
	projectId: string
}) {
	const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects/${projectId}/`

	return (
		<PhotoProvider>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-0.5'>
				{gallery.map((item, index) => (
					<PhotoView key={index} src={posterURLBase + item}>
						<Image
							src={posterURLBase + item}
							alt={item}
							width={400}
							height={225}
							className='w-full cursor-pointer object-cover aspect-video'
						/>
					</PhotoView>
				))}
			</div>
		</PhotoProvider>
	)
}
