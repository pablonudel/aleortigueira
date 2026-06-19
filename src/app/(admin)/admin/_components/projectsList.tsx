"use client"

import { getAllCategoriesType } from "@/actions/category.actions"
import { deleteProject, getAllProjectsType } from "@/actions/project.actions"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty"
import { Project } from "@/generated/prisma/client"
import { EllipsisVertical } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import ProjectForm from "./projectForm"

const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects`
type projectType = Project & { category: { name: string } }

async function handleDelete(projectId: string) {
	const { success, message } = await deleteProject(projectId)
	if (!success) {
		toast.error(message || "Error al eliminar el proyecto.")
	} else {
		toast.success(message || "Proyecto eliminado con éxito.")
	}
}

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

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
			{data.map((project, index) => (
				<div key={index} className='relative'>
					<ProjectMenu project={project} categories={categories} />
					<Card className={`${project.isPublic ? "" : "bg-muted/50"}`}>
						<Image
							src={`${posterURLBase}/${project.id}/${project.poster}`}
							alt={project.name}
							width={400}
							height={300}
							className={`${project.isPublic ? "" : "opacity-60"} w-full h-auto object-cover`}
							loading='eager'
						/>
						<CardHeader>
							<CardTitle className='truncate'>{project.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{project.category.name}</p>
							<p>{project.isPublic ? "Público" : "Privado"}</p>
						</CardContent>
					</Card>
				</div>
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

function ProjectMenu({
	project,
	categories,
}: {
	project: projectType
	categories: getAllCategoriesType
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='default'
					size='icon'
					className='absolute top-2 right-2 z-10'>
					<EllipsisVertical />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem asChild>
					<ProjectForm mode='edit' categories={categories} project={project} />
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant='destructive' size='sm' className='w-full'>
								Eliminar
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
								<AlertDialogDescription>
									Esta acción no se puede deshacer. ¿Estás seguro de que quieres
									eliminar este proyecto? Todos los datos asociados al proyecto
									se perderán permanentemente.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={() => handleDelete(project.id)}>
									Continuar
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
