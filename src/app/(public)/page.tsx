import BioSection from "@/components/bioSection"
import ProjectList from "@/components/projectList"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
	title: "Alejandro Ortigueira - Director de Fotografia",
	description:
		"Alejandro Ortigueira - Director de Fotografía | México | Argentina",
	keywords: [
		"ADF",
		"dirección de fotografia",
		"méxico",
		"argentina",
		"series",
		"films",
		"cine",
		"publicidades",
		"clips",
	],
	openGraph: {
		title: "Alejandro Ortigueira - Director de Fotografia",
		description:
			"Alejandro Ortigueira - Director de Fotografía | México | Argentina",
		siteName: "aleortigueira.com",
		locale: "es_ES",
		type: "website",
		images: "https://www.aleortigueira.com/aoweb.jpg",
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			"max-snippet": -1,
			"max-image-preview": "large",
			"max-video-preview": -1,
		},
	},
}

export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ category?: string }>
}) {
	return (
		<div className='space-y-16'>
			<Suspense fallback={<ProjectListSkeleton />}>
				<ProjectList searchParams={searchParams} />
			</Suspense>
			<BioSection />
		</div>
	)
}

function ProjectListSkeleton() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-1'>
			<Skeleton className='aspect-video w-full' />
			<Skeleton className='aspect-video w-full hidden md:block' />
			<Skeleton className='aspect-video w-full hidden xl:block' />
			<Skeleton className='aspect-video w-full hidden 2xl:block' />
		</div>
	)
}
