import { Project } from "@/generated/prisma/client"
import Image from "next/image"
import Link from "next/link"

type projectType = Project & { category: { name: string | null } }
const posterURLBase = `${process.env.NEXT_PUBLIC_TIGRIS_PUBLIC_ACCESS_URL}/projects`

export default function ProjectItem({ project }: { project: projectType }) {
	return (
		<Link href={`/${project.slug}`}>
			<div className='relative hover:scale-95 transition-transform duration-300'>
				<div className='absolute top-0 left-0 w-full h-full bg-black/40 bg-opacity-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
					<h3 className='text-white text-2xl font-bold tracking-wider'>
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
					width={400}
					height={300}
					loading='eager'
					className='w-full h-auto object-cover'
				/>
			</div>
		</Link>
	)
}
