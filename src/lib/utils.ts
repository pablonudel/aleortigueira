import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
	if (!str) return str
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function listOfYears() {
	const currentYear = new Date().getFullYear()
	const years = []
	for (let year = currentYear; year >= 2000; year--) {
		years.push(year.toString())
	}
	return years
}

export function slugify(input: string) {
	return input
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

export function unslugify(input: string) {
	const result = input.replace(/-/g, " ")
	return result.charAt(0).toUpperCase() + result.slice(1)
}

export const MAX_FILE_SIZE = 500 * 1024
export const ACCEPTED_TYPES = ["image/jpeg", "image/png"]
export const countriesList = ["Argentina", "México"]
export const socialNetworksList = ["Instagram", "Vimeo", "Linkedin"]
