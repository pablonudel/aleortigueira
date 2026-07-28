"use server"

import { Prisma } from "@/generated/prisma/client"
import prisma from "@/lib/prisma"
import { remove } from "@tigrisdata/storage"
import { revalidatePath } from "next/cache"
import { uploadImage, validateImage } from "./common.actions"

const userName = process.env.ADMIN_NAME as string
const PROFILE_IMAGE_NAME = "profleImage"
const PROFILE_IMAGE_PATH = `profile/${PROFILE_IMAGE_NAME}`

export async function getProfile() {
	try {
		const profile = await prisma.user.findFirst({
			where: {
				name: userName,
			},
			select: {
				image: true,
				bio: true,
				email: true,
				phones: true,
				socialNetworks: true,
			},
		})
		return { success: true, data: profile }
	} catch (error) {
		console.error("Error fetching profile:", error)
		return { success: false, error: "Failed to fetch profile" }
	}
}

export type profileType = {
	success: boolean
	data: {
		image: string | null
		bio: string | null
		email: string | null
		phones: Record<string, string> | null
		socialNetworks: Record<string, string> | null
	} | null
	error?: string
}

export async function editProfile(formData: FormData) {
	try {
		if (!userName) {
			return { success: false, message: "Admin name is required." }
		}

		const currentProfile = await prisma.user.findFirst({
			where: { name: userName },
			select: {
				id: true,
				image: true,
			},
		})

		if (!currentProfile) {
			return { success: false, message: "Profile not found." }
		}

		const bio = (formData.get("bio") || "").toString().trim()
		const email = (formData.get("email") || "").toString().trim()
		const phonesRaw = (formData.get("phones") || "{}").toString()
		const socialNetworksRaw = (
			formData.get("socialNetworks") || "{}"
		).toString()
		const removeImage =
			(formData.get("removeImage") || "").toString() === "true"
		const imageFile = formData.get("image")

		let imageName = currentProfile.image
		if (imageFile instanceof File && imageFile.size > 0) {
			const imageError = validateImage(imageFile)
			if (imageError) {
				return { success: false, message: imageError }
			}

			await uploadImage(imageFile, PROFILE_IMAGE_PATH)
			imageName = PROFILE_IMAGE_NAME

			if (currentProfile.image && currentProfile.image !== PROFILE_IMAGE_NAME) {
				await remove(`profile/${currentProfile.image}`)
			}
		} else if (removeImage && currentProfile.image) {
			await remove(`profile/${currentProfile.image}`)
			imageName = null
		}

		let phones: Record<string, string> | null = null
		let socialNetworks: Record<string, string> | null = null

		try {
			phones = JSON.parse(phonesRaw)
		} catch {
			phones = null
		}

		try {
			socialNetworks = JSON.parse(socialNetworksRaw)
		} catch {
			socialNetworks = null
		}

		await prisma.user.update({
			where: { id: currentProfile.id },
			data: {
				bio: bio || null,
				email,
				phones: phones ?? Prisma.JsonNull,
				socialNetworks: socialNetworks ?? Prisma.JsonNull,
				image: imageName,
			},
		})

		revalidatePath("/admin")
		revalidatePath("/")
		revalidatePath("/(public)/[slug]")
		revalidatePath("/(public)/tag/[categoryName]", "page")

		return { success: true, message: "Perfil actualizado correctamente" }
	} catch (error) {
		console.error("Error updating profile:", error)
		return { success: false, message: "Error al actualizar el perfil" }
	}
}
