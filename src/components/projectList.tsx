import { getProjects } from "@/actions/project.actions"
import { unslugify } from "@/lib/utils"
import { DatabaseX, MessageSquareWarning } from "lucide-react"
import ProjectItem from "./projectItem"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty"

export default async function ProjectList({
	searchParams,
}: {
	searchParams: Promise<{ category?: string }>
}) {
	"use cache"
	const { category } = await searchParams
	const { success, data } = await getProjects(category)

	if (!success) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<DatabaseX />
					</EmptyTitle>
					<EmptyDescription>
						Se ha producido un error al cargar los proyectos. Inténtalo de nuevo
						más tarde.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	if (!data || data.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<MessageSquareWarning />
					</EmptyTitle>
					<EmptyDescription>
						No se han encontrado proyectos para la categoría seleccionada.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	const unSlugifiedCategory = category && unslugify(category)

	return (
		<div className='space-y-8'>
			{category && (
				<h2 className='text-3xl font-medium uppercase px-4 md:px-8'>
					{unSlugifiedCategory}
				</h2>
			)}
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
				{data.map((project, index) => (
					<ProjectItem key={index} project={project} />
				))}
			</div>
		</div>
	)
}
