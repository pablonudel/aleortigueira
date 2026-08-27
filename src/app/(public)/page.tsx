import BioSection from "@/components/bioSection"
import ProjectList from "@/components/projectList"

export default function Home() {
	return (
		<div className='space-y-8'>
			<ProjectList />
			<BioSection />
		</div>
	)
}
