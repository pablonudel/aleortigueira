"use client"

import {
	addCategory,
	deleteCategory,
	editCategory,
	getAllCategoriesType,
} from "@/actions/category.actions"
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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Trash } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
	name: z
		.string()
		.min(2, "El nombre debe tener al menos 2 caracteres")
		.max(100, "El nombre no puede exceder los 100 caracteres"),
})

export default function CategoryAdmin({
	categories,
}: {
	categories: getAllCategoriesType
}) {
	const [open, setOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

	const addCategoryForm = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
		},
	})

	const editCategoryForm = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedCategory || "",
		},
	})

	function handleEditCategory(name: string) {
		editCategoryForm.reset({ name })
		setSelectedCategory(name)
		setOpen(true)
	}

	async function onSubmitCategory(data: z.infer<typeof formSchema>) {
		const res = await addCategory(data.name)
		if (res.success) {
			toast.success(res.message)
			addCategoryForm.reset()
		} else {
			toast.error(res.message)
		}
	}

	async function onSubmitEditCategory(data: z.infer<typeof formSchema>) {
		const res = await editCategory(selectedCategory!, data.name)
		if (res.success) {
			toast.success(res.message)
			setOpen(false)
			setSelectedCategory(null)
		} else {
			toast.error(res.message)
		}
	}

	async function handleDeleteCategory(name: string) {
		const res = await deleteCategory(name)
		if (res.success) {
			toast.success(res.message)
		} else {
			toast.error(res.message)
		}
	}

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant='outline' size='icon'>
						<Pencil />
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Categorias</DialogTitle>
					</DialogHeader>
					<ScrollArea className='w-full h-64'>
						{categories.data.map((category, index) => (
							<Item key={index} variant='outline' className='mb-2'>
								<ItemContent>
									<ItemTitle>{category.name}</ItemTitle>
									<ItemDescription>
										{category.projects.length}{" "}
										{category.projects.length === 1 ? "proyecto" : "proyectos"}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Button
										variant='outline'
										size='icon'
										onClick={() => handleEditCategory(category.name)}>
										<Pencil />
									</Button>
									{category.projects.length === 0 && (
										<Button
											variant='destructive'
											size='icon'
											onClick={() => handleDeleteCategory(category.name)}>
											<Trash />
										</Button>
									)}
								</ItemActions>
							</Item>
						))}
					</ScrollArea>
					<form className='mt-4' id='addCategory-form'>
						<Controller
							name='name'
							control={addCategoryForm.control}
							render={({ field, fieldState }) => (
								<div>
									<Input placeholder='Nueva Categoria' {...field} />
									{fieldState.error && (
										<p className='text-red-500 text-sm mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
					</form>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Cancelar</Button>
						</DialogClose>
						<Button
							type='submit'
							form='addCategory-form'
							onClick={addCategoryForm.handleSubmit(onSubmitCategory)}>
							Agregar Categoria
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Category Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Categoría</DialogTitle>
					</DialogHeader>
					<form id='editCategory-form'>
						<Controller
							name='name'
							control={editCategoryForm.control}
							render={({ field, fieldState }) => (
								<div>
									<Input placeholder='Nombre de la categoría' {...field} />
									{fieldState.error && (
										<p className='text-red-500 text-sm mt-1'>
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
					</form>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Cancelar</Button>
						</DialogClose>
						<Button
							type='submit'
							form='editCategory-form'
							onClick={editCategoryForm.handleSubmit(onSubmitEditCategory)}>
							Editar Categoría
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
