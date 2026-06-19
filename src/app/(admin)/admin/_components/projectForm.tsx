"use client"

import { getAllCategoriesType } from "@/actions/category.actions"
import { createProject, editProjectById } from "@/actions/project.actions"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Project } from "@/generated/prisma/client"
import { listOfYears, slugify } from "@/lib/utils"
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	pointerWithin,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import CategoryAdmin from "./categoryAdmin"

const MAX_FILE_SIZE = 500 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png"]

type PreviewFile = {
	id: string
	file?: File
	url: string
	name?: string
	isExisting: boolean
}

type projectType = Project & { category: { name: string } }

const fileSchema = z
	.custom<File>((value) => value instanceof File, {
		message: "Selecciona una imagen.",
	})
	.refine((file) => ACCEPTED_TYPES.includes(file.type), {
		message: "Solo se permiten imagenes JPG o PNG.",
	})
	.refine((file) => file.size <= MAX_FILE_SIZE, {
		message: "La imagen supera el maximo de 500KB.",
	})

const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects`

export default function ProjectForm({
	mode,
	categories,
	project,
}: {
	mode: string
	categories: getAllCategoriesType
	project?: projectType
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant={`${mode === "edit" ? "ghost" : "outline"}`}
					size='sm'
					className={`${mode === "edit" && "w-full"}`}>
					{mode === "create" ? "Nuevo Proyecto" : "Editar"}
				</Button>
			</DialogTrigger>

			<DialogContent className='max-w-md sm:max-w-lg md:max-w-xl lg:max-w-5xl xl:max-w-7xl'>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Crear nuevo proyecto" : "Editar Proyecto"}
					</DialogTitle>
				</DialogHeader>
				<div className='max-h-[70vh] overflow-y-auto pe-4'>
					<AddProjectForm
						key={mode === "edit" && project ? project.id : "create"}
						categories={categories}
						mode={mode}
						project={project}
					/>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancelar</Button>
					</DialogClose>
					<Button form='addProjectForm' type='submit'>
						{mode === "create" ? "Crear" : "Guardar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// Add Project Form

const formSchema = z.object({
	name: z
		.string()
		.min(3, "El nombre del proyecto debe tener al menos 3 caracteres"),
	description: z.string().optional(),
	category: z.string().min(1, "Selecciona una categoría"),
	isPublic: z.boolean(),
	year: z.string().min(1, "Selecciona un año"),
	video: z.string().optional(),
	poster: fileSchema.optional().nullable(),
	gallery: z.array(fileSchema).optional(),
})

function AddProjectForm({
	categories,
	project,
	mode,
}: {
	categories: getAllCategoriesType
	project?: projectType
	mode: string
}) {
	const initialPosterPreview = (() => {
		if (mode === "edit" && project?.poster) {
			return {
				id: `poster-${project.poster}`,
				url: `${posterURLBase}/${project.id}/${project.poster}`,
				name: project.poster,
				isExisting: true,
			}
		}
		return null
	})()

	const initialGalleryPreviews = (() => {
		if (mode === "edit" && project) {
			return project.gallery.map((fileName) => ({
				id: `gallery-${fileName}`,
				url: `${posterURLBase}/${project.id}/${fileName}`,
				name: fileName,
				isExisting: true,
			}))
		}
		return [] as PreviewFile[]
	})()

	const [posterPreview, setPosterPreview] = useState<PreviewFile | null>(
		() => initialPosterPreview,
	)
	const [galleryPreviews, setGalleryPreviews] = useState<PreviewFile[]>(
		() => initialGalleryPreviews,
	)
	const [activeId, setActiveId] = useState<string | null>(null)
	const [overId, setOverId] = useState<string | null>(null)
	const [removePoster, setRemovePoster] = useState(false)
	const posterPreviewRef = useRef<PreviewFile | null>(null)
	const galleryPreviewsRef = useRef<PreviewFile[]>([])
	const sensors = useSensors(useSensor(PointerSensor))

	const defaultValues = useMemo(
		() =>
			mode === "edit" && project
				? {
						name: project.name,
						description: project.description || "",
						isPublic: project.isPublic,
						category: project.categoryId,
						year: project.year.toString(),
						video: project.video || "",
						poster: null,
						gallery: [],
					}
				: {
						name: "",
						description: "",
						isPublic: false,
						category: "",
						year: new Date().getFullYear().toString(),
						video: "",
						poster: null,
						gallery: [],
					},
		[mode, project],
	)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues,
	})

	const orderedGalleryItems = (() => {
		return galleryPreviews
	})()
	const activeItem = useMemo(
		() => galleryPreviews.find((item) => item.id === activeId) || null,
		[activeId, galleryPreviews],
	)

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const formData = new FormData()
		const slug = slugify(data.name)

		formData.append("name", data.name)
		formData.append("slug", slug)
		formData.append("description", data.description || "")
		formData.append("category", data.category)
		formData.append("year", data.year)
		formData.append("video", data.video || "")
		formData.append("isPublic", data.isPublic ? "true" : "false")

		if (data.poster instanceof File) {
			formData.append("poster", data.poster)
		}

		if (mode === "edit" && project) {
			formData.append("projectId", project.id)
			formData.append("removePoster", removePoster ? "true" : "false")

			const galleryOrder: Array<
				{ type: "existing"; name: string } | { type: "new"; index: number }
			> = []
			let newIndex = 0
			orderedGalleryItems.forEach((item) => {
				if (item.isExisting && item.name) {
					galleryOrder.push({ type: "existing", name: item.name })
					return
				}
				if (item.file) {
					formData.append("gallery", item.file)
					galleryOrder.push({ type: "new", index: newIndex })
					newIndex += 1
				}
			})
			formData.append("galleryOrder", JSON.stringify(galleryOrder))
			const result = await editProjectById(formData)
			if (!result.success) {
				toast.error(result.message)
				return
			}
			toast.success(result.message)
			form.setValue("poster", null, { shouldValidate: true })
			form.setValue("gallery", [], { shouldValidate: true })
			setRemovePoster(false)
			return
		}

		orderedGalleryItems.forEach((item) => {
			if (item.file) formData.append("gallery", item.file)
		})

		const result = await createProject(formData)
		if (!result.success) {
			toast.error(result.message)
			return
		}
		toast.success(result.message)
		form.reset()
		if (posterPreview?.file) {
			URL.revokeObjectURL(posterPreview.url)
		}
		setPosterPreview(null)
		galleryPreviews.forEach((preview) => {
			if (preview.file) URL.revokeObjectURL(preview.url)
		})
		setGalleryPreviews([])
	}

	const isPublic = useWatch({ control: form.control, name: "isPublic" })

	const onPosterDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				const message =
					fileRejections[0]?.errors[0]?.message || "Archivo invalido."
				form.setError("poster", { type: "manual", message })
				return
			}
			const file = acceptedFiles[0]
			if (!file) return
			const url = URL.createObjectURL(file)
			if (posterPreview) {
				if (posterPreview.file) {
					URL.revokeObjectURL(posterPreview.url)
				}
			}
			setRemovePoster(false)
			setPosterPreview({
				id: crypto.randomUUID(),
				file,
				url,
				isExisting: false,
			})
			form.setValue("poster", file, { shouldValidate: true })
			form.clearErrors("poster")
		},
		[form, posterPreview],
	)

	const onGalleryDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				const message =
					fileRejections[0]?.errors[0]?.message || "Archivo invalido."
				form.setError("gallery", { type: "manual", message })
				return
			}
			const newPreviews = acceptedFiles.map((file) => ({
				id: crypto.randomUUID(),
				file,
				url: URL.createObjectURL(file),
				isExisting: false,
			}))
			setGalleryPreviews((prev) => [...prev, ...newPreviews])
			const currentFiles = form.getValues("gallery") || []
			form.setValue("gallery", [...currentFiles, ...acceptedFiles], {
				shouldValidate: true,
			})
			form.clearErrors("gallery")
		},
		[form],
	)

	const {
		getRootProps: getPosterRootProps,
		getInputProps: getPosterInputProps,
		isDragActive: isPosterDragActive,
	} = useDropzone({
		accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
		maxSize: MAX_FILE_SIZE,
		multiple: false,
		onDrop: onPosterDrop,
	})

	const {
		getRootProps: getGalleryRootProps,
		getInputProps: getGalleryInputProps,
		isDragActive: isGalleryDragActive,
	} = useDropzone({
		accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
		maxSize: MAX_FILE_SIZE,
		multiple: true,
		onDrop: onGalleryDrop,
	})

	const handleDeleteGalleryItem = useCallback(
		(itemId: string) => {
			const itemToDelete = galleryPreviews.find((item) => item.id === itemId)
			if (!itemToDelete) return

			if (itemToDelete.file) {
				URL.revokeObjectURL(itemToDelete.url)
			}

			const updatedPreviews = galleryPreviews.filter(
				(item) => item.id !== itemId,
			)
			setGalleryPreviews(updatedPreviews)

			const currentFiles = form.getValues("gallery") || []
			const updatedFiles = currentFiles.filter(
				(file) => file !== itemToDelete.file,
			)
			form.setValue("gallery", updatedFiles, { shouldValidate: true })
		},
		[galleryPreviews, form],
	)

	const handleDeletePoster = useCallback(() => {
		if (posterPreview?.file) {
			URL.revokeObjectURL(posterPreview.url)
		}
		if (posterPreview?.isExisting) {
			setRemovePoster(true)
		}
		setPosterPreview(null)
		form.setValue("poster", null, { shouldValidate: true })
	}, [posterPreview, form])

	useEffect(() => {
		form.reset(defaultValues)
	}, [form, defaultValues])

	useEffect(() => {
		posterPreviewRef.current = posterPreview
		galleryPreviewsRef.current = galleryPreviews
	}, [posterPreview, galleryPreviews])

	useEffect(() => {
		return () => {
			const poster = posterPreviewRef.current
			if (poster?.file) {
				URL.revokeObjectURL(poster.url)
			}
			galleryPreviewsRef.current.forEach((preview) => {
				if (preview.file) URL.revokeObjectURL(preview.url)
			})
		}
	}, [])

	return (
		<form
			id='addProjectForm'
			onSubmit={form.handleSubmit(onSubmit)}
			className='space-y-4'>
			<Controller
				name='isPublic'
				control={form.control}
				render={({ field }) => (
					<div className='flex gap-2 items-center'>
						<Switch
							id='isPublic'
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
						<Label htmlFor='isPublic'>
							Proyecto {isPublic ? "Público" : "Privado"}
						</Label>
					</div>
				)}
			/>
			<div className='flex flex-col lg:flex-row w-full gap-4'>
				<div className='space-y-4 w-full xl:w-3/5'>
					<Controller
						name='name'
						control={form.control}
						render={({ field, fieldState }) => (
							<div>
								<Label>Nombre del proyecto</Label>
								<Input {...field} />
								{fieldState.error && (
									<p className='text-red-500 text-sm mt-1'>
										{fieldState.error.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						name='description'
						control={form.control}
						render={({ field }) => (
							<div>
								<Label>Descripción</Label>
								<Textarea {...field} className='h-51.5' />
							</div>
						)}
					/>

					<div className='flex gap-4 w-full'>
						<Controller
							name='category'
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='w-full'>
									<div className='flex items-end-safe gap-2'>
										<div className='grow'>
											<Label>Categoría</Label>
											<Select
												value={field.value}
												onValueChange={(value) => field.onChange(value)}>
												<SelectTrigger className='w-full'>
													<SelectValue
														placeholder={
															categories.data.length > 0
																? "Seleccionar categoría"
																: "No hay categorías disponibles"
														}
													/>
												</SelectTrigger>
												<SelectContent>
													{categories.data.map((category) => (
														<SelectItem key={category.id} value={category.id}>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<CategoryAdmin categories={categories} />
									</div>
									{fieldState.error && (
										<p className='text-red-500 text-sm mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<Controller
							name='year'
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='w-1/4'>
									<Label>Año</Label>
									<Select
										value={field.value}
										onValueChange={(value) => field.onChange(value)}>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder={field.value} />
										</SelectTrigger>
										<SelectContent>
											{listOfYears().map((year) => (
												<SelectItem key={year} value={year}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.error && (
										<p className='text-red-500 text-sm mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
					</div>
				</div>

				<div className='space-y-4 w-full xl:w-2/5'>
					<Controller
						name='video'
						control={form.control}
						render={({ field }) => (
							<div>
								<Label>Url del video</Label>
								<Input {...field} placeholder='https://...' />
							</div>
						)}
					/>

					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<Label>Poster</Label>
							<span className='text-xs text-muted-foreground'>
								JPG/PNG hasta 500KB
							</span>
						</div>
						{!posterPreview && (
							<div
								{...getPosterRootProps()}
								className={`flex w-full h-67.5 cursor-pointer items-center justify-center border border-dashed px-4 text-sm transition ${
									isPosterDragActive ? "bg-muted" : "bg-transparent"
								}`}>
								<input {...getPosterInputProps()} />
								<span className='text-center'>
									<Upload className='mx-auto mb-2' />
									{isPosterDragActive
										? "Suelta la imagen aqui"
										: "Arrastra una imagen o haz click para seleccionar"}
								</span>
							</div>
						)}
						{form.formState.errors.poster && (
							<p className='text-red-500 text-sm'>
								{form.formState.errors.poster.message}
							</p>
						)}
						{posterPreview && (
							<div className='mt-2 w-full'>
								<div className='relative flex justify-center'>
									<Image
										src={posterPreview.url}
										alt='Poster preview'
										width={400}
										height={300}
										className='w-full h-auto object-cover'
										loading='eager'
										unoptimized
									/>
									<Button
										type='button'
										variant='secondary'
										size='icon'
										className='absolute right-2 top-2'
										onClick={() => handleDeletePoster()}>
										<X />
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label>Galeria</Label>
					<span className='text-xs text-muted-foreground'>
						JPG/PNG hasta 500KB
					</span>
				</div>
				<div
					{...getGalleryRootProps()}
					className={`flex min-h-28 w-full cursor-pointer items-center justify-center border border-dashed px-4 text-sm transition ${
						isGalleryDragActive ? "bg-muted" : "bg-transparent"
					}`}>
					<input {...getGalleryInputProps()} />
					<span className='text-center'>
						<Upload className='mx-auto mb-2' />
						{isGalleryDragActive
							? "Suelta las imagenes aqui"
							: "Arrastra imagenes o haz click para seleccionar"}
					</span>
				</div>
				<DndContext
					sensors={sensors}
					collisionDetection={pointerWithin}
					onDragStart={({ active }) => {
						setActiveId(String(active.id))
					}}
					onDragOver={({ over }) => {
						setOverId(over ? String(over.id) : null)
					}}
					onDragCancel={() => {
						setActiveId(null)
						setOverId(null)
					}}
					onDragEnd={({ active, over }) => {
						setActiveId(null)
						setOverId(null)
						if (!over || active.id === over.id) return
						setGalleryPreviews((items) => {
							const oldIndex = items.findIndex((item) => item.id === active.id)
							const newIndex = items.findIndex((item) => item.id === over.id)
							if (oldIndex === -1 || newIndex === -1) return items
							return arrayMove(items, oldIndex, newIndex)
						})
					}}>
					<SortableContext
						items={galleryPreviews.map((item) => item.id)}
						strategy={rectSortingStrategy}>
						<div className='grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-6'>
							{galleryPreviews.map((preview) => (
								<SortableGalleryItem
									key={preview.id}
									item={preview}
									isDragging={Boolean(activeId)}
									isActive={activeId === preview.id}
									isOverTarget={
										overId === preview.id && activeId !== preview.id
									}
									onRemove={() => handleDeleteGalleryItem(preview.id)}
								/>
							))}
						</div>
					</SortableContext>
					<DragOverlay modifiers={[snapCenterToCursor]}>
						{activeItem ? (
							<div
								className='h-32 w-60 border bg-center bg-cover'
								style={{ backgroundImage: `url(${activeItem.url})` }}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
				{form.formState.errors.gallery && (
					<p className='text-red-500 text-sm'>
						{form.formState.errors.gallery.message}
					</p>
				)}
			</div>
		</form>
	)
}

function SortableGalleryItem({
	item,
	isDragging,
	isActive,
	isOverTarget,
	onRemove,
}: {
	item: PreviewFile
	isDragging: boolean
	isActive: boolean
	isOverTarget: boolean
	onRemove: () => void
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: item.id })
	const opacity = isActive || isOverTarget ? 0.6 : 1
	const freezePosition = isDragging
	const style = {
		transform: freezePosition ? undefined : CSS.Transform.toString(transform),
		transition: freezePosition ? undefined : transition,
		opacity,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='relative overflow-hidden border touch-none'>
			<Image
				src={item.url}
				alt='Gallery preview'
				width={240}
				height={240}
				className='h-32 w-full object-cover'
				loading='eager'
				unoptimized
			/>
			<div
				className='absolute inset-0 cursor-grab active:cursor-grabbing'
				{...attributes}
				{...listeners}
			/>
			<Button
				type='button'
				variant='secondary'
				size='icon'
				className='absolute right-1 top-1 z-10'
				onClick={(event) => {
					event.stopPropagation()
					onRemove()
				}}>
				<X />
			</Button>
		</div>
	)
}
