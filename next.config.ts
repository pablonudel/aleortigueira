import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	cacheComponents: true,
	experimental: {
		serverActions: {
			bodySizeLimit: "25mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "aleo.t3.tigrisfiles.io",
			},
		],
	},
}

export default nextConfig
