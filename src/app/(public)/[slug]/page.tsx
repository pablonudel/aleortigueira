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
			<div className='px-8'>
				<h1 className='uppercase font-bold'>{data!.name}</h1>
				<p className='whitespace-pre-line'>{data!.description}</p>
			</div>
			<iframe
				title='vimeo-player'
				src={`${data!.video}`}
				width='100%'
				height='auto'
				referrerPolicy='strict-origin-when-cross-origin'
				allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'
				allowFullScreen
				className='w-full aspect-video'
			/>
		</Suspense>
	)
}
