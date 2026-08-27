import Link from "next/link"

const mainURL = process.env.MAIN_URL || "http://localhost:3000"

export default function NavBar() {
	return (
		<nav className='flex items-center justify-between px-6 py-8 md:p-8'>
			<Link href={`${mainURL}/`} replace>
				<div>
					<h1 className='text-xl md:text-2xl font-bold uppercase leading-5 md:leading-6'>
						Alejandro Ortigueira (ADF)
					</h1>
					<h2 className='text-lg uppercase tracking-wide text-muted-foreground leading-6 md:leading-6'>
						Director de Fotografía
					</h2>
				</div>
			</Link>
			<menu>
				<ul className='hidden md:flex gap-4'>
					<Link href={mainURL}>
						<li>Work</li>
					</Link>
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
			</menu>
		</nav>
	)
}
