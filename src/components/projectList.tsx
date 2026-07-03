import { getAllProjects } from "@/actions/project.actions"
import ProjectItem from "./projectItem"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty"

export default async function ProjectList() {
	"use cache"
	const { success, message, data } = await getAllProjects(true)

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

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
			{data.map((project, index) => (
				<ProjectItem key={index} project={project} />
			))}
		</div>
	)
}
