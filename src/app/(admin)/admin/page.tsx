import { getAllCategories } from "@/actions/category.actions"
import { getAllProjects } from "@/actions/project.actions"
import ProjectForm from "./_components/projectForm"
import ProjectsList from "./_components/projectsList"

export default async function Admin() {
	const categories = await getAllCategories()
	const projects = await getAllProjects()

	return (
		<div className='p-8 space-y-8'>
			<div className='flex justify-between items-center w-full'>
				<h2 className='text-3xl font-light'>Proyectos</h2>
				<ProjectForm mode='create' categories={categories} />
			</div>
			<ProjectsList projects={projects} categories={categories} />
		</div>
	)
}
