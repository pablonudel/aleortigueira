import BioSection from "@/components/bioSection"
import ProjectList from "@/components/projectList"
import { Suspense } from "react"

export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	return (
		<div className='space-y-8'>
			<Suspense fallback={<div>Cargando proyectos...</div>}>
				{searchParams.then(({ category }) => (
					<ProjectList category={category as string | undefined} />
				))}
			</Suspense>
			<BioSection />
		</div>
	)
}
