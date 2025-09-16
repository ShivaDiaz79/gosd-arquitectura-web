import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: [
			"lh3.googleusercontent.com",
			"lh4.googleusercontent.com",
			"lh5.googleusercontent.com",
			"lh6.googleusercontent.com",
			"graph.facebook.com",
			"platform-lookaside.fbsbx.com",
			"firebasestorage.googleapis.com",
		],
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});
		return config;
	},
};

export default nextConfig;
