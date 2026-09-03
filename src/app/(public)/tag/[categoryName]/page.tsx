import { getProjectsByCategoryName } from "@/actions/project.actions"
import ProjectItem from "@/components/projectItem"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty"
import { unslugify } from "@/lib/utils"
import { Suspense } from "react"

export default async function Page({
	params,
}: {
	params: Promise<{ categoryName: string }>
}) {
	return (
		<Suspense fallback={<div>Cargando proyecto...</div>}>
			{params.then(({ categoryName }) => (
				<Content categoryName={categoryName} />
			))}
		</Suspense>
	)
}

async function Content({ categoryName }: { categoryName: string }) {
	"use cache"
	const catName = unslugify(categoryName)
	const { success, message, data } = await getProjectsByCategoryName(
		categoryName,
		true,
	)

	if (!success) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{message}</EmptyTitle>
					<EmptyDescription>
						Se ha producido un error al cargar los proyectos. Inténtalo de nuevo
						más tarde.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	if (data.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No se encontraron proyectos</EmptyTitle>
					<EmptyDescription>
						No se han encontrado proyectos en la categoría {catName}.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}
	return (
		<div className='flex-1'>
			<div className='px-8 pb-8'>
				<h2 className='text-xl font-bold uppercase'>{catName}</h2>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
				{data.map((project, index) => (
					<ProjectItem key={index} project={project} />
				))}
			</div>
		</div>
	)
}
