"use server"

import { Project } from "@/generated/prisma/client"
import prisma from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { put, remove } from "@tigrisdata/storage"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"

const MAX_FILE_SIZE = 500 * 1024
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"])

const EXTENSION_BY_TYPE: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
}

type CreateProjectResult = {
	success: boolean
	message: string
	projectId?: string
}

type EditProjectResult = {
	success: boolean
	message: string
	projectId?: string
	data?: {
		poster: string | null
		gallery: string[]
	}
}

function validateImage(file: File) {
	if (!ACCEPTED_TYPES.has(file.type)) {
		return "Solo se permiten imagenes JPG o PNG."
	}
	if (file.size > MAX_FILE_SIZE) {
		return "La imagen supera el maximo de 500KB."
	}
	return null
}

async function uploadImage(file: File, path: string) {
	const arrayBuffer = await file.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	const result = await put(path, buffer, {
		access: "public",
		contentType: file.type,
	})
	if (result.error) {
		throw new Error(result.error.message)
	}
	return result.data?.url || ""
}

async function getUniqueSlug(baseSlug: string) {
	const existing = await prisma.project.findUnique({
		where: { slug: baseSlug },
		select: { id: true },
	})
	if (!existing) return baseSlug
	const suffix = crypto.randomUUID().slice(0, 8)
	return `${baseSlug}-${suffix}`
}

export async function createProject(
	formData: FormData,
): Promise<CreateProjectResult> {
	try {
		const name = (formData.get("name") || "").toString().trim()
		const description = (formData.get("description") || "").toString().trim()
		const categoryId = (formData.get("category") || "").toString().trim()
		const yearRaw = (formData.get("year") || "").toString().trim()
		const video = (formData.get("video") || "").toString().trim()
		const isPublic = (formData.get("isPublic") || "").toString() === "true"
		const slugInput = (formData.get("slug") || "").toString().trim()
		const posterFile = formData.get("poster")
		const galleryFiles = formData.getAll("gallery")
		const projectId = crypto.randomUUID()

		const baseSlug = slugify(slugInput || name)
		if (!baseSlug) {
			return { success: false, message: "No se pudo generar el slug." }
		}

		const existingByName = await prisma.project.findUnique({
			where: { name },
			select: { id: true },
		})
		if (existingByName) {
			return {
				success: false,
				message: "Ya existe un proyecto con ese nombre.",
			}
		}

		const slug = await getUniqueSlug(baseSlug)

		const year = Number(yearRaw)
		if (!Number.isFinite(year)) {
			return { success: false, message: "El año es invalido." }
		}

		let fileName: string | null = null
		if (posterFile instanceof File && posterFile.size > 0) {
			const posterError = validateImage(posterFile)
			if (posterError) {
				return { success: false, message: posterError }
			}
			const extension = EXTENSION_BY_TYPE[posterFile.type] || "jpg"
			fileName = `poster-${nanoid(8)}.${extension}`
			const posterPath = `projects/${projectId}/${fileName}`
			await uploadImage(posterFile, posterPath)
		}

		const galleryFileNames: string[] = []
		for (const item of galleryFiles) {
			if (!(item instanceof File) || item.size === 0) continue
			const galleryError = validateImage(item)
			if (galleryError) {
				return { success: false, message: galleryError }
			}
			const extension = EXTENSION_BY_TYPE[item.type] || "jpg"
			const fileName = `gallery-${nanoid(8)}.${extension}`
			const galleryPath = `projects/${projectId}/${fileName}`
			const url = await uploadImage(item, galleryPath)
			if (url) galleryFileNames.push(fileName)
		}

		const project = await prisma.project.create({
			data: {
				id: projectId,
				name,
				slug,
				description: description || null,
				categoryId,
				year,
				poster: fileName,
				video: video || null,
				gallery: galleryFileNames,
				isPublic,
			},
			select: { id: true },
		})

		revalidatePath("/admin")
		return {
			success: true,
			message: "Proyecto creado con exito.",
			projectId: project.id,
		}
	} catch (error) {
		console.error("Error creating project:", error)
		const message =
			error instanceof Error && error.message
				? `Error al crear el proyecto: ${error.message}`
				: "Error al crear el proyecto."
		return { success: false, message }
	}
}

export async function getAllProjects(
	publicOnly = false,
): Promise<getAllProjectsType> {
	try {
		const projects = await prisma.project.findMany({
			where: publicOnly ? { isPublic: true } : undefined,
			orderBy: {
				order: "desc",
			},
			include: {
				category: {
					select: { name: true },
				},
			},
		})

		return {
			success: true,
			message: "Proyectos obtenidos con éxito.",
			data: projects,
		}
	} catch (error) {
		console.error("Error fetching projects:", error)
		return {
			success: false,
			message: "Error al obtener los proyectos.",
			data: [],
		}
	}
}

export type getAllProjectsType = {
	success: boolean
	message?: string
	data: (Project & {
		category: {
			name: string
		}
	})[]
}

export async function getProjectById(projectId: string) {
	try {
		if (!projectId) {
			return { success: false, message: "ID del proyecto es requerido." }
		}
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				category: {
					select: { name: true },
				},
			},
		})
		if (!project) {
			return { success: false, message: "Proyecto no encontrado." }
		}
		return { success: true, data: project }
	} catch (error) {
		console.error("Error fetching project:", error)
		return { success: false, message: "Error al obtener el proyecto." }
	}
}

export async function getProjectBySlug(slug: string) {
	try {
		if (!slug) {
			return { succes: false, message: "Slug del proyecto es requerido." }
		}
		const project = await prisma.project.findUnique({
			where: { slug },
			include: {
				category: {
					select: { name: true },
				},
			},
		})
		if (!project) {
			return { success: false, message: "Proyecto no encontrado." }
		}
		return { success: true, data: project }
	} catch (error) {
		console.error("Error fetching project by slug:", error)
		return { success: false, message: "Error al obtener el proyecto." }
	}
}

export async function deleteProject(projectId: string) {
	try {
		if (!projectId) {
			return { success: false, message: "ID del proyecto es requerido." }
		}
		const project = await getProjectById(projectId)

		const posterUrl = project.success ? project.data?.poster : null
		if (posterUrl) {
			const posterKey = `projects/${projectId}/${posterUrl}`
			await remove(posterKey)
		}

		const galleryFileNames = project.success ? project.data?.gallery || [] : []
		for (const fileName of galleryFileNames) {
			const galleryKey = `projects/${projectId}/${fileName}`
			await remove(galleryKey)
		}

		await prisma.project.delete({
			where: { id: projectId },
		})
		revalidatePath("/admin")
		revalidatePath("/")
		return { success: true, message: "Proyecto eliminado con éxito." }
	} catch (error) {
		console.error("Error deleting project:", error)
		return { success: false, message: "Error al eliminar el proyecto." }
	}
}

export async function editProjectById(
	formData: FormData,
): Promise<EditProjectResult> {
	try {
		const projectId = (formData.get("projectId") || "").toString().trim()
		if (!projectId) {
			return { success: false, message: "ID del proyecto es requerido." }
		}

		const currentProject = await prisma.project.findUnique({
			where: { id: projectId },
			select: {
				id: true,
				name: true,
				slug: true,
				poster: true,
				gallery: true,
			},
		})

		if (!currentProject) {
			return { success: false, message: "Proyecto no encontrado." }
		}

		const name = (formData.get("name") || "").toString().trim()
		const description = (formData.get("description") || "").toString().trim()
		const categoryId = (formData.get("category") || "").toString().trim()
		const yearRaw = (formData.get("year") || "").toString().trim()
		const video = (formData.get("video") || "").toString().trim()
		const isPublic = (formData.get("isPublic") || "").toString() === "true"
		const slugInput = (formData.get("slug") || "").toString().trim()
		const posterFile = formData.get("poster")
		const removePoster =
			(formData.get("removePoster") || "").toString() === "true"
		const galleryFiles = formData.getAll("gallery")
		const hasGalleryOrder = formData.has("galleryOrder")
		const galleryOrderRaw = (formData.get("galleryOrder") || "").toString()

		const year = Number(yearRaw)
		if (!Number.isFinite(year)) {
			return { success: false, message: "El año es invalido." }
		}

		const existingByName = await prisma.project.findFirst({
			where: {
				name,
				NOT: { id: projectId },
			},
			select: { id: true },
		})
		if (existingByName) {
			return {
				success: false,
				message: "Ya existe un proyecto con ese nombre.",
			}
		}

		const baseSlug = slugify(slugInput || name)
		if (!baseSlug) {
			return { success: false, message: "No se pudo generar el slug." }
		}

		let slug = baseSlug
		if (baseSlug !== currentProject.slug) {
			const existingBySlug = await prisma.project.findFirst({
				where: {
					slug: baseSlug,
					NOT: { id: projectId },
				},
				select: { id: true },
			})
			if (existingBySlug) {
				slug = await getUniqueSlug(baseSlug)
			}
		}

		let posterFileName: string | null = currentProject.poster
		if (posterFile instanceof File && posterFile.size > 0) {
			const posterError = validateImage(posterFile)
			if (posterError) {
				return { success: false, message: posterError }
			}
			const extension = EXTENSION_BY_TYPE[posterFile.type] || "jpg"
			posterFileName = `poster-${nanoid(8)}.${extension}`
			const posterPath = `projects/${projectId}/${posterFileName}`
			await uploadImage(posterFile, posterPath)
			if (currentProject.poster) {
				const oldPosterKey = `projects/${projectId}/${currentProject.poster}`
				await remove(oldPosterKey)
			}
		} else if (removePoster && currentProject.poster) {
			const oldPosterKey = `projects/${projectId}/${currentProject.poster}`
			await remove(oldPosterKey)
			posterFileName = null
		}

		let galleryOrder: Array<{ type: "existing" | "new"; name?: string }> = []
		if (galleryOrderRaw) {
			try {
				galleryOrder = JSON.parse(galleryOrderRaw)
			} catch {
				galleryOrder = []
			}
		}

		const newGalleryFiles = galleryFiles.filter(
			(item): item is File => item instanceof File && item.size > 0,
		)

		const keepExisting = new Set<string>()
		const galleryFileNames: string[] = []
		let newFileIndex = 0

		for (const entry of galleryOrder) {
			if (entry.type === "existing" && entry.name) {
				keepExisting.add(entry.name)
				galleryFileNames.push(entry.name)
				continue
			}
			if (entry.type === "new") {
				const file = newGalleryFiles[newFileIndex]
				newFileIndex += 1
				if (!file) continue
				const galleryError = validateImage(file)
				if (galleryError) {
					return { success: false, message: galleryError }
				}
				const extension = EXTENSION_BY_TYPE[file.type] || "jpg"
				const fileName = `gallery-${nanoid(8)}.${extension}`
				const galleryPath = `projects/${projectId}/${fileName}`
				const url = await uploadImage(file, galleryPath)
				if (url) galleryFileNames.push(fileName)
			}
		}

		if (!hasGalleryOrder) {
			galleryFileNames.push(...currentProject.gallery)
			currentProject.gallery.forEach((name) => keepExisting.add(name))
		}

		for (; newFileIndex < newGalleryFiles.length; newFileIndex += 1) {
			const file = newGalleryFiles[newFileIndex]
			const galleryError = validateImage(file)
			if (galleryError) {
				return { success: false, message: galleryError }
			}
			const extension = EXTENSION_BY_TYPE[file.type] || "jpg"
			const fileName = `gallery-${nanoid(8)}.${extension}`
			const galleryPath = `projects/${projectId}/${fileName}`
			const url = await uploadImage(file, galleryPath)
			if (url) galleryFileNames.push(fileName)
		}

		const removedGallery = currentProject.gallery.filter(
			(name) => !keepExisting.has(name),
		)
		for (const fileName of removedGallery) {
			const galleryKey = `projects/${projectId}/${fileName}`
			await remove(galleryKey)
		}

		const project = await prisma.project.update({
			where: { id: projectId },
			data: {
				name,
				slug,
				description: description || null,
				categoryId,
				year,
				poster: posterFileName,
				video: video || null,
				gallery: galleryFileNames,
				isPublic,
			},
			select: { id: true },
		})

		revalidatePath("/admin")
		revalidatePath("/")
		revalidatePath(`/${slug}`)
		return {
			success: true,
			message: "Proyecto actualizado con exito.",
			projectId: project.id,
			data: {
				poster: posterFileName,
				gallery: galleryFileNames,
			},
		}
	} catch (error) {
		console.error("Error editing project:", error)
		const message =
			error instanceof Error && error.message
				? `Error al editar el proyecto: ${error.message}`
				: "Error al editar el proyecto."
		return { success: false, message }
	}
}
