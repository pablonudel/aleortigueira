import { getProjectBySlug } from "@/actions/project.actions"
import { Suspense } from "react"

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	return (
		<Suspense fallback={<div>Cargando proyecto...</div>}>
			{params.then(({ slug }) => (
				<Content slug={slug} />
			))}
		</Suspense>
	)
}

async function Content({ slug }: { slug: string }) {
	"use cache"
	const { success, message, data } = await getProjectBySlug(slug)

	if (!success) {
		return <div>{message}</div>
	}

	return (
		<Suspense fallback={<div>Cargando proyecto...</div>}>
			<div className='flex flex-col lg:flex-row w-full'>
				{data!.video && (
					<iframe
						title='vimeo-player'
						src={`${data!.video}`}
						width='100%'
						height='auto'
						referrerPolicy='strict-origin-when-cross-origin'
						allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'
						allowFullScreen
						className='w-full xl:w-3/5 h-auto aspect-video'
					/>
				)}
				<div className='p-8 w-full bg-muted-foreground/10 lg:my-8'>
					<p>{data!.year}</p>
					<h1 className='font-bold tracking-wide mb-8'>{data!.name}</h1>
					<p className='whitespace-pre-line mb-8'>{data!.description}</p>
					<p>{data!.category.name}</p>
				</div>
			</div>
			{data!.gallery.length > 0 && (
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-4'>Galería</h2>
				</div>
			)}
		</Suspense>
	)
}
