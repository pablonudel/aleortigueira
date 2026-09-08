import { getProjectBySlug } from "@/actions/project.actions"
import { Spinner } from "@/components/ui/spinner"
import { slugify } from "@/lib/utils"
import { Tag } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { Suspense } from "react"
import ImageGallery from "./_components/imageGallery"

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return (
		<Suspense
			fallback={
				<div className='flex items-center justify-center h-full'>
					<Spinner className='size-8' />
				</div>
			}>
			<Content slug={slug} />
		</Suspense>
	)
}

async function Content({ slug }: { slug: string }) {
	"use cache"
	cacheTag(`project:${slug}`)
	const { success, message, data } = await getProjectBySlug(slug)

	if (!success) {
		return <div>{message}</div>
	}

	const slugifiedCategoryName = slugify(data!.category.name)

	return (
		<div className='flex-1 mb-16'>
			<div className='flex flex-col xl:flex-row w-full'>
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
				<div className='p-4 md:p-8 w-full bg-muted-foreground/10 xl:my-8'>
					<h1 className='text-3xl font-bold tracking-wide mb-8'>
						{data!.name}
					</h1>
					<p className='whitespace-pre-line mb-8'>{data!.description}</p>
					<Link
						href={`/?category=${slugifiedCategoryName}`}
						className='text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1'>
						<Tag size={14} strokeWidth={2} />
						{data!.category.name}
					</Link>
				</div>
			</div>
			{data!.gallery.length > 0 && (
				<div className='px-4 md:px-8 pt-16'>
					<ImageGallery gallery={data!.gallery} projectId={data!.id} />
				</div>
			)}
		</div>
	)
}
