"use client"

import { getAllCategoriesType } from "@/actions/category.actions"
import {
	deleteProject,
	getAllProjectsType,
	reorderProjects,
} from "@/actions/project.actions"
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
import { Card, CardContent } from "@/components/ui/card"
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
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EllipsisVertical, Move, Tag } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
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

	const dataKey = data
		.map(({ id, isPublic, updatedAt }) => `${id}-${isPublic}-${updatedAt}`)
		.join("|")

	return (
		<SortableProjects key={dataKey} projects={data} categories={categories} />
	)
}

function SortableProjects({
	projects,
	categories,
}: {
	projects: getAllProjectsType["data"]
	categories: getAllCategoriesType
}) {
	const [projectItems, setProjectItems] = useState(projects)
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor),
	)

	async function handleDragEnd({ active, over }: DragEndEvent) {
		if (!over || active.id === over.id) return

		const oldIndex = projectItems.findIndex(({ id }) => id === active.id)
		const newIndex = projectItems.findIndex(({ id }) => id === over.id)
		if (oldIndex === -1 || newIndex === -1) return

		const previousItems = projectItems
		const nextItems = arrayMove(projectItems, oldIndex, newIndex)
		setProjectItems(nextItems)

		const result = await reorderProjects(nextItems.map(({ id }) => id))
		if (!result.success) {
			setProjectItems(previousItems)
			toast.error(result.message)
			return
		}
		toast.success(result.message)
	}

	return (
		<DndContext
			id='projects-reorder'
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}>
			<SortableContext
				items={projectItems.map(({ id }) => id)}
				strategy={rectSortingStrategy}>
				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2'>
					{projectItems.map((project) => (
						<SortableProjectCard
							key={project.id}
							project={project}
							categories={categories}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	)
}

function SortableProjectCard({
	project,
	categories,
}: {
	project: getAllProjectsType["data"][number]
	categories: getAllCategoriesType
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: project.id })

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className={`relative ${isDragging ? "z-20 opacity-60" : ""}`}>
			<Button
				ref={setActivatorNodeRef}
				{...listeners}
				{...attributes}
				className='absolute top-2 left-2 z-10'
				variant='default'
				size='icon'
				type='button'
				aria-label={`Mover ${project.name}`}
				title={`Mover ${project.name}`}>
				<Move />
			</Button>
			<ProjectMenu
				project={{
					...project,
					category: {
						...project.category,
						name: project.category.name ?? "",
					},
				}}
				categories={categories}
			/>
			<Card className={`${project.isPublic ? "" : "bg-muted/50"}`}>
				<Image
					src={`${posterURLBase}/${project.id}/${project.poster}`}
					alt={project.name}
					width={400}
					height={300}
					className={`${project.isPublic ? "" : "opacity-50"} w-full h-auto object-cover`}
					loading='eager'
				/>
				<CardContent>
					<h2 className='truncate capitalize mb-2'>{project.name}</h2>
					<p className='flex items-center gap-2'>
						<Tag size={14} />
						{project.category.name}
					</p>
				</CardContent>
			</Card>
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
