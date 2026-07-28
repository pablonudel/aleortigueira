import { MAX_FILE_SIZE } from "@/lib/utils"
import { put } from "@tigrisdata/storage"

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"])

export function validateImage(file: File) {
	if (!ACCEPTED_TYPES.has(file.type)) {
		return "Solo se permiten imagenes JPG o PNG."
	}
	if (file.size > MAX_FILE_SIZE) {
		return "La imagen supera el maximo de 500KB."
	}
	return null
}

export async function uploadImage(file: File, path: string) {
	"use server"
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
