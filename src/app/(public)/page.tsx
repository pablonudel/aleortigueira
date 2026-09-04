import BioSection from "@/components/bioSection"
import ProjectList from "@/components/projectList"
import { Suspense } from "react"

export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ category?: string }>
}) {
	return (
		<div className='space-y-8'>
			<Suspense fallback={<div>Cargando proyectos...</div>}>
				<ProjectList searchParams={searchParams} />
			</Suspense>
			<BioSection />
		</div>
	)
}
