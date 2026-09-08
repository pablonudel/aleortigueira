import { getProjectBySlug } from "@/actions/project.actions"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty"
import { slugify } from "@/lib/utils"
import { MessageCircleWarning, Tag } from "lucide-react"
import Link from "next/link"
import { Suspense, type ComponentProps } from "react"
import ImageGallery from "./_components/imageGallery"

type ContentData = {
	id: string
	slug: string
	name: string
	description: string | null
	video?: string | null
	category: {
		name: string
	}
	gallery: ComponentProps<typeof ImageGallery>["gallery"]
}

export default function Page({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	return (
		<Suspense fallback={<div>Cargando...</div>}>
			<ProjectPage params={params} />
		</Suspense>
	)
}

async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const { success, data } = await getProjectBySlug(slug)

	if (!success || !data) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<MessageCircleWarning />
					</EmptyTitle>
					<EmptyDescription>
						Proyecto no encontrado. Puede que haya sido eliminado o que la URL
						sea incorrecta.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	return <Content data={data} />
}

async function Content({ data }: { data: ContentData }) {
	// "use cache"
	// cacheTag(`project:${data.slug}`)

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
