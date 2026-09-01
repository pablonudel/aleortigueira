import { unslugify } from "@/lib/utils"
import Link from "next/link"
import { AppSideBar } from "./AppSideBar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { SidebarTrigger } from "./ui/sidebar"

const mainURL = process.env.MAIN_URL || "http://localhost:3000"

export default function NavBar({ categories }: { categories: string[] }) {
	return (
		<nav className='flex items-center justify-between px-6 py-8 md:p-8'>
			<Link href={`${mainURL}/`} replace>
				<div>
					<h1 className='text-[1.1rem] md:text-2xl font-bold uppercase md:leading-6'>
						Alejandro Ortigueira (ADF)
					</h1>
					<h2 className='text-[1rem] md:text-xl uppercase tracking-wide text-muted-foreground leading-6 md:leading-8'>
						Director de Fotografía
					</h2>
				</div>
			</Link>
			<menu>
				<ul className='hidden md:flex gap-4'>
					<li>
						<DropdownMenu>
							<DropdownMenuTrigger className='focus:outline-none'>
								Work
							</DropdownMenuTrigger>
							<DropdownMenuContent align='center' sideOffset={16}>
								<Link href={`${mainURL}/`} replace>
									<DropdownMenuItem>Todos</DropdownMenuItem>
								</Link>
								{categories.map((category) => (
									<Link
										key={category}
										href={{
											pathname: "/",
											search: `?category=${category}`,
										}}
										replace>
										<DropdownMenuItem>{unslugify(category)}</DropdownMenuItem>
									</Link>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					<li>
						<Link href={`${mainURL}/#bio`} replace>
							Bio
						</Link>
					</li>
					<li>
						<Link href='#contacto' replace>
							Contacto
						</Link>
					</li>
				</ul>
				<div className='md:hidden'>
					<AppSideBar categories={categories} />
					<SidebarTrigger />
				</div>
			</menu>
		</nav>
	)
}
