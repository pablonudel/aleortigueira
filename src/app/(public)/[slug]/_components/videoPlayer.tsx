"use client"

import ReactPlayer from "react-player"

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
	return (
		<ReactPlayer
			src={videoUrl}
			width='100%'
			height='100%'
			controls={true}
			playing={false}
			onReady={() => console.log("Video listo")}
		/>
	)
}
