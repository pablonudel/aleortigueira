import "react-photo-view/dist/react-photo-view.css"

import ContactSection from "@/components/contactSection"
import NavBar from "@/components/navBar"
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col min-h-screen gap-8'>
			<div className='flex-1'>
				<NavBar />
				{children}
			</div>
			<ContactSection />
		</div>
	)
}
