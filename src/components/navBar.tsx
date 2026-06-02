export default function NavBar() {
	return (
		<nav className='flex items-center justify-between p-8'>
			<div>
				<h1 className='text-2xl font-bold uppercase leading-6'>
					Alejandro Ortigueira
				</h1>
				<h2 className='text-lg uppercase tracking-wide text-muted-foreground leading-6'>
					Director de Fotografía
				</h2>
			</div>
			<menu>
				<ul className='flex gap-4'>
					<li>Work</li>
					<li>Bio</li>
					<li>Contacto</li>
				</ul>
			</menu>
		</nav>
	)
}
