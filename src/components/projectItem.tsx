import { Project } from "@/generated/prisma/client"
import Image from "next/image"
import Link from "next/link"

type projectType = Project & { category: { name: string | null } }
const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects`

export default function ProjectItem({ project }: { project: projectType }) {
	return (
		<Link
			href={`/${project.slug}`}
			className='relative block w-full h-full overflow-hidden group'>
			<div className='relative w-full h-full transition-transform duration-300 group-hover:scale-y-95 group-hover:scale-x-97'>
				<div className='absolute inset-0 z-10 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
					<h3 className='text-white text-2xl font-bold tracking-wider text-center px-4'>
						{project.name}
					</h3>
				</div>
				<Image
					src={
						project.poster
							? `${posterURLBase}/${project.id}/${project.poster}`
							: "/placeholder.jpg"
					}
					alt={project.name}
					width={800}
					height={450}
					loading='lazy'
					className='w-full h-full object-cover block'
				/>
			</div>
		</Link>
	)
}
