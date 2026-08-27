"use client"

import { editProfile, profileType } from "@/actions/profile.actions"
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
import { Textarea } from "@/components/ui/textarea"
import {
	ACCEPTED_TYPES,
	countriesList,
	MAX_FILE_SIZE,
	socialNetworksList,
} from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CirclePlus, Trash, Upload, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

export default function ProfileForm({ profile }: { profile: profileType }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline'>Editar Perfil</Button>
			</DialogTrigger>
			<DialogContent className='max-w-md sm:max-w-lg md:max-w-xl'>
				<DialogHeader>
					<DialogTitle>Editar Perfil</DialogTitle>
				</DialogHeader>
				<div className='max-h-[70vh] overflow-y-auto pe-4'>
					<EditProfileForm profile={profile} />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancelar</Button>
					</DialogClose>
					<Button form='edit-profile-form' type='submit'>
						Guardar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

/// Edit Profile Form
const profileImageURLbase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/profile`

type PreviewFile = {
	id: string
	file?: File
	url: string
	name?: string
	isExisting: boolean
}

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

const phoneItemSchema = z.object({
	country: z.string().min(1, "El país es requerido"),
	number: z.string().min(1, "El número es requerido"),
})

const socialNetworkSchema = z.object({
	platform: z.string().min(1, "La plataforma es requerida"),
	url: z.url("Ingresa una URL valida"),
})

const formSchema = z.object({
	image: fileSchema.optional().nullable(),
	bio: z.string().optional(),
	email: z.email("Ingresa un correo valido").optional(),
	phones: z
		.array(phoneItemSchema)
		.optional()
		.transform((items) => {
			if (!items) return {}
			return items.reduce<Record<string, string>>((acc, item) => {
				if (item.country && item.number) {
					acc[item.country] = item.number
				}
				return acc
			}, {})
		}),
	socialNetworks: z
		.array(socialNetworkSchema)
		.optional()
		.transform((items) => {
			if (!items) return {}
			return items.reduce<Record<string, string>>((acc, item) => {
				if (item.platform && item.url) {
					acc[item.platform] = item.url
				}
				return acc
			}, {})
		}),
})

type FormInput = z.input<typeof formSchema>
type FormOutput = z.output<typeof formSchema>

function EditProfileForm({ profile }: { profile: profileType }) {
	const initialImagePreview = (() => {
		if (profile.data?.image) {
			return {
				id: `image-${profile.data.image}`,
				url: `${profileImageURLbase}/${profile.data.image}`,
				name: profile.data.image,
				isExisting: true,
			}
		}
		return null
	})()

	const [imagePreview, setImagePreview] = useState<PreviewFile | null>(
		() => initialImagePreview,
	)
	const [removeImage, setRemoveImage] = useState(false)

	const imagePreviewRef = useRef<PreviewFile | null>(null)

	// Helper para transformar el JSON de Postgres a Array
	function mapPhonesToForm(phones?: Record<string, string> | null) {
		if (!phones) return []
		return Object.entries(phones).map(([country, number]) => ({
			country,
			number,
		}))
	}

	function mapSocialNetworksToForm(
		socialNetworks?: Record<string, string> | null,
	) {
		if (!socialNetworks) return []
		return Object.entries(socialNetworks).map(([platform, url]) => ({
			platform,
			url,
		}))
	}

	const defaultValues = {
		image: null,
		bio: profile.data?.bio ?? undefined,
		email: profile.data?.email ?? undefined,
		phones: mapPhonesToForm(profile.data?.phones),
		socialNetworks: mapSocialNetworksToForm(profile.data?.socialNetworks),
	}

	const form = useForm<FormInput, unknown, FormOutput>({
		resolver: zodResolver(formSchema),
		defaultValues,
	})

	const onImageDrop = useCallback(
		(acceptedFiles: File[], fileRejections: FileRejection[]) => {
			if (fileRejections.length > 0) {
				const message =
					fileRejections[0]?.errors[0]?.message || "Archivo invalido."
				form.setError("image", { type: "manual", message })
				return
			}
			const file = acceptedFiles[0]
			if (!file) return
			const url = URL.createObjectURL(file)
			if (imagePreview?.file) {
				URL.revokeObjectURL(imagePreview.url)
			}
			setImagePreview({
				id: crypto.randomUUID(),
				file,
				url,
				isExisting: false,
			})
			form.setValue("image", file, { shouldValidate: true })
			form.clearErrors("image")
		},
		[form, imagePreview],
	)

	const {
		getRootProps: getImageRootProps,
		getInputProps: getImageInputProps,
		isDragActive: isImageDragActive,
	} = useDropzone({
		accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
		maxSize: MAX_FILE_SIZE,
		multiple: false,
		onDrop: onImageDrop,
	})

	// Hook para manipular dinámicamente los teléfonos (agregar/quitar)
	const {
		fields: phoneFields,
		append: appendPhone,
		remove: removePhone,
	} = useFieldArray({
		control: form.control,
		name: "phones",
	})

	// Hook para manipular dinámicamente las redes sociales (agregar/quitar)
	const {
		fields: socialFields,
		append: appendSocial,
		remove: removeSocial,
	} = useFieldArray({
		control: form.control,
		name: "socialNetworks",
	})

	const handleDeleteImage = useCallback(() => {
		if (imagePreview?.file) {
			URL.revokeObjectURL(imagePreview.url)
		}
		if (imagePreview?.isExisting) {
			setRemoveImage(true)
		}
		setImagePreview(null)
		form.setValue("image", null, { shouldValidate: true })
	}, [imagePreview, form])

	useEffect(() => {
		imagePreviewRef.current = imagePreview
	}, [imagePreview])

	useEffect(() => {
		return () => {
			const image = imagePreviewRef.current
			if (image?.file) {
				URL.revokeObjectURL(image.url)
			}
		}
	}, [])

	async function onSubmit(data: z.infer<typeof formSchema>) {
		const formData = new FormData()

		formData.append("bio", data.bio ?? "")
		formData.append("email", data.email ?? "")

		if (data.phones) {
			formData.append("phones", JSON.stringify(data.phones))
		} else {
			formData.append("phones", JSON.stringify({}))
		}
		if (data.socialNetworks) {
			formData.append("socialNetworks", JSON.stringify(data.socialNetworks))
		} else {
			formData.append("socialNetworks", JSON.stringify({}))
		}
		if (data.image instanceof File) {
			formData.append("image", data.image)
		}
		formData.append("removeImage", removeImage ? "true" : "false")
		const result = await editProfile(formData)
		if (!result.success) {
			toast.error(result.message)
			return
		}
		toast.success(result.message)
		console.log("Form submitted with data:", data)
	}
	return (
		<form
			id='edit-profile-form'
			onSubmit={form.handleSubmit(onSubmit)}
			className='space-y-8'>
			<div className='space-y-2'>
				<div className='flex items-center justify-between'>
					<Label>Imagen de perfil</Label>
					<span className='text-xs text-muted-foreground'>
						JPG/PNG hasta 500KB
					</span>
				</div>
				{!imagePreview && (
					<div
						{...getImageRootProps()}
						className={`flex min-h-36 w-full cursor-pointer items-center justify-center border border-dashed px-4 text-sm transition ${
							isImageDragActive ? "bg-muted" : "bg-transparent"
						}`}>
						<input {...getImageInputProps()} />
						<span className='text-center'>
							<Upload className='mx-auto mb-2' />
							{isImageDragActive
								? "Suelta la imagen aqui"
								: "Arrastra una imagen o haz click para seleccionar"}
						</span>
					</div>
				)}
				{form.formState.errors.image && (
					<p className='text-red-500 text-sm'>
						{form.formState.errors.image.message}
					</p>
				)}
				{imagePreview && (
					<div className='mt-2 w-full'>
						<div className='relative flex justify-center overflow-hidden border'>
							<Image
								src={imagePreview.url}
								alt='Imagen de perfil'
								width={480}
								height={320}
								className='w-full h-auto object-cover'
								loading='eager'
								unoptimized
							/>
							<Button
								type='button'
								variant='secondary'
								size='icon'
								className='absolute right-2 top-2'
								onClick={() => handleDeleteImage()}>
								<X />
							</Button>
						</div>
					</div>
				)}
			</div>

			<Controller
				name='bio'
				control={form.control}
				render={({ field }) => (
					<div>
						<Label>Bio</Label>
						<Textarea {...field} className='h-51.5' />
					</div>
				)}
			/>

			<Controller
				name='email'
				control={form.control}
				render={({ field, fieldState }) => (
					<div>
						<Label>Email</Label>
						<Input {...field} />
						{fieldState.error && (
							<p className='text-red-500 text-sm mt-1'>
								{fieldState.error.message}
							</p>
						)}
					</div>
				)}
			/>

			{/* Sección de Teléfonos */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<Label>Teléfonos</Label>
					<button
						onClick={() => appendPhone({ country: "", number: "" })}
						className='opacity-50 hover:opacity-100'>
						<CirclePlus size={18} />
					</button>
				</div>

				{phoneFields.map((field, index) => (
					<div key={field.id} className='flex gap-2 items-start'>
						<Controller
							name={`phones.${index}.country`}
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='w-1/3'>
									{/* <Input {...field} placeholder='Ej: Argentina' /> */}
									<Select
										value={field.value}
										onValueChange={(value) => field.onChange(value)}>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Selecciona un país' />
										</SelectTrigger>
										<SelectContent>
											{countriesList.map((item) => (
												<SelectItem key={item} value={item}>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.error && (
										<p className='text-red-500 text-xs mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<Controller
							name={`phones.${index}.number`}
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='flex-1'>
									<Input {...field} placeholder='Ej: +5491112345678' />
									{fieldState.error && (
										<p className='text-red-500 text-xs mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<button
							onClick={() => removePhone(index)}
							className='opacity-50 hover:opacity-100 mt-3'>
							<Trash size={18} />
						</button>
					</div>
				))}
			</div>

			{/* Sección de Redes Sociales */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<Label>Redes Sociales</Label>
					<button
						onClick={() => appendSocial({ platform: "", url: "" })}
						className='opacity-50 hover:opacity-100'>
						<CirclePlus size={18} />
					</button>
				</div>

				{socialFields.map((field, index) => (
					<div key={field.id} className='flex gap-2 items-start'>
						<Controller
							name={`socialNetworks.${index}.platform`}
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='w-1/3'>
									<Select
										value={field.value}
										onValueChange={(value) => field.onChange(value)}>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Selecciona una red' />
										</SelectTrigger>
										<SelectContent>
											{socialNetworksList.map((item) => (
												<SelectItem key={item} value={item}>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.error && (
										<p className='text-red-500 text-xs mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<Controller
							name={`socialNetworks.${index}.url`}
							control={form.control}
							render={({ field, fieldState }) => (
								<div className='flex-1'>
									<Input
										{...field}
										placeholder='Ej: https://www.instagram.com/username'
									/>
									{fieldState.error && (
										<p className='text-red-500 text-xs mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<button
							onClick={() => removeSocial(index)}
							className='opacity-50 hover:opacity-100 mt-3'>
							<Trash size={18} />
						</button>
					</div>
				))}
			</div>
		</form>
	)
}
