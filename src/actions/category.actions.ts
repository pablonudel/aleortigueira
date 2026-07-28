"use server"

import prisma from "@/lib/prisma"
import { slugify, unslugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function addCategory(name: string) {
	try {
		const categoryName = slugify(name)

		const existingCategory = await getCategoryByName(categoryName)
		if (existingCategory) {
			return { success: false, message: "La categoría ya existe" }
		}

		const category = await prisma.category.create({
			data: {
				name: categoryName,
			},
		})
		revalidatePath("/admin")
		return {
			success: true,
			message: "Categoria creada con éxito",
			categoryId: category.id,
		}
	} catch (error) {
		console.error("Error creating category:", error)
		return { success: false, message: "Error al crear la categoría" }
	}
}

export async function getAllCategories() {
	try {
		let categories = await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				projects: true,
			},
		})
		categories = categories.map((category) => ({
			...category,
			name: unslugify(category.name),
		}))
		return { success: true, data: categories }
	} catch (error) {
		console.error("Error fetching categories:", error)
		return { success: false, data: [] }
	}
}

export type getAllCategoriesType = {
	success: boolean
	data: {
		id: string
		name: string
		projects: { id: string }[]
	}[]
}

export async function getCategoryByName(name: string) {
	try {
		const category = await prisma.category.findUnique({
			where: { name: name },
			include: {
				projects: {
					select: { id: true },
				},
			},
		})
		return category
	} catch (error) {
		console.error("Error finding category by name:", error)
		return null
	}
}

export async function getCategoryById(id: string) {
	try {
		const category = await prisma.category.findUnique({
			where: { id: id },
		})
		return category
	} catch (error) {
		console.error("Error finding category by id:", error)
		return null
	}
}

export type getCategoryByNameType = {
	id: string
	name: string
	projects: { id: string }[]
} | null

export async function editCategory(name: string, newName: string) {
	try {
		const newCategoryName = slugify(newName)
		if (name === newCategoryName) {
			return { success: false, message: "El nuevo nombre es igual al actual" }
		}
		const category = await getCategoryByName(name)
		if (!category) {
			return { success: false, message: "Categoría no encontrada" }
		}
		const existingCategory = await getCategoryByName(newCategoryName)
		if (existingCategory) {
			return { success: false, message: "El nombre de la categoría ya existe" }
		}
		await prisma.category.update({
			where: { name },
			data: { name: newCategoryName },
		})
		revalidatePath("/admin")
		return {
			success: true,
			message: "Categoría editada con éxito",
		}
	} catch (error) {
		console.error("Error editing category:", error)
		return { success: false, message: "Error al editar la categoría" }
	}
}

export async function deleteCategory(name: string) {
	try {
		const categoryName = slugify(name)
		const category = await getCategoryByName(categoryName)
		if (!category) {
			return { success: false, message: "Categoría no encontrada" }
		}
		if (category.projects.length > 0) {
			return {
				success: false,
				message: "No se puede eliminar una categoría con proyectos asociados",
			}
		}
		await prisma.category.delete({
			where: { name: categoryName },
		})
		revalidatePath("/admin")
		return { success: true, message: "Categoría eliminada con éxito" }
	} catch (error) {
		console.error("Error deleting category:", error)
		return { success: false, message: "Error al eliminar la categoría" }
	}
}
