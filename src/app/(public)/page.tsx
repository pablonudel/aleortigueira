import BioSection from "@/components/bioSection"
import ProjectList from "@/components/projectList"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ category?: string }>
}) {
	return (
		<div className='space-y-8'>
			<Suspense fallback={<ProjectListSkeleton />}>
				<ProjectList searchParams={searchParams} />
			</Suspense>
			<BioSection />
		</div>
	)
}

function ProjectListSkeleton() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
			<Skeleton className='aspect-video w-full' />
			<Skeleton className='aspect-video w-full hidden md:block' />
			<Skeleton className='aspect-video w-full hidden xl:block' />
			<Skeleton className='aspect-video w-full hidden 2xl:block' />
		</div>
	)
}
