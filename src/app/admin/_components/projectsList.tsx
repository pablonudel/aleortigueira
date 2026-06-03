"use client"

import { getAllCategoriesType } from "@/actions/category.actions"
import { deleteProject, getAllProjectsType } from "@/actions/project.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty"
import Image from "next/image"
import { toast } from "sonner"
import ProjectForm from "./projectForm"

const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects`

export default function ProjectsList({
	projects,
	categories,
}: {
	projects: getAllProjectsType
	categories: getAllCategoriesType
}) {
	const { success, data, message } = projects

	if (!success) {
		return <ErrorList message={message || "Error al cargar los proyectos."} />
	}

	if (data.length === 0) {
		return <EmptyList />
	}

	async function handleDelete(projectId: string) {
		const { success, message } = await deleteProject(projectId)
		if (!success) {
			toast.error(message || "Error al eliminar el proyecto.")
		} else {
			toast.success(message || "Proyecto eliminado con éxito.")
		}
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
			{data.map((project, index) => (
				<Card key={index}>
					<Image
						src={`${posterURLBase}/${project.id}/${project.poster}`}
						alt={project.name}
						width={400}
						height={300}
						className='w-full h-64 object-cover'
						loading='eager'
					/>
					<CardHeader>
						<CardTitle>{project.name}</CardTitle>
						<ProjectForm
							mode='edit'
							categories={categories}
							project={project}
						/>
						<Button
							variant='outline'
							size='sm'
							onClick={() => handleDelete(project.id)}>
							Eliminar
						</Button>
					</CardHeader>
					<CardContent>
						<p>{project.category.name}</p>
						<p>{project.isPublic ? "Público" : "Privado"}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

function ErrorList({ message }: { message: string }) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>{message}</EmptyTitle>
				<EmptyDescription>
					Se ha producido un error al cargar los proyectos. Inténtalo de nuevo
					más tarde. Si el problema persiste, contacta al soporte.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	)
}

function EmptyList() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No hay proyectos</EmptyTitle>
				<EmptyDescription>
					No se han encontrado proyectos. Agrega un nuevo proyecto para
					mostrarlo aquí.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	)
}
