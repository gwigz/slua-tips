import {
	GitChangelog,
	GitChangelogMarkdownSection,
} from "@nolebase/vitepress-plugin-git-changelog/vite";
import { InlineLinkPreviewElementTransform } from "@nolebase/vitepress-plugin-inline-link-preview/markdown-it";
import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";
import { sluaTransformer } from "./slua/transformer";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	lang: "en-US",
	title: "slua.tips",
	description: "Tips and tricks for SLua",
	vite: {
		plugins: [
			// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
			tailwindcss() as any,
			{
				name: "vp-tw-order-fix",
				configResolved(c) {
					movePlugin(
						// biome-ignore lint/suspicious/noExplicitAny: types don't match vitepress
						c.plugins as any,
						"@tailwindcss/vite:scan",
						"after",
						"vitepress",
					);
				},
			},
			GitChangelog({
				repoURL: () => "https://github.com/gwigz/slua-tips",
			}),
			GitChangelogMarkdownSection(),
		],
		optimizeDeps: {
			exclude: ["@nolebase/vitepress-plugin-inline-link-preview/markdown-it"],
		},
		ssr: {
			noExternal: ["@nolebase/*"],
		},
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [{ text: "Resources", link: "/resources" }],
		sidebar: [
			{
				text: "Resources",
				link: "/resources",
				items: [
					{
						text: "Fetch",
						link: "/resources/fetch",
					},
					{
						text: "Prim Params Batching",
						link: "/resources/prim-params-batching",
					},
				],
			},
		],
		socialLinks: [
			{ icon: "github", link: "https://github.com/gwigz/slua-tips" },
		],
		outline: {
			level: [2, 3],
		},
		editLink: {
			text: "Edit this page on GitHub",
			pattern: "https://github.com/gwigz/slua-tips/edit/main/src/:path",
		},
		footer: {
			message:
				'<span class="font-normal"><a href="https://slua.tips">slua.tips</a> is not affiliated with Second Life, Linden Lab, or Luau.<br class="hidden sm:block" /> All trademarks and registered trademarks are the property of their respective owners.</span>',
		},
	},
	head: [
		[
			"meta",
			{
				name: "viewport",
				content: "width=device-width,initial-scale=1,user-scalable=no",
			},
		],
	],
	markdown: {
		theme: {
			light: "catppuccin-latte",
			dark: "catppuccin-mocha",
		},
		codeTransformers: [
			sluaTransformer,

			// biome-ignore lint/suspicious/noExplicitAny: types being dumb
			transformerNotationDiff() as any,
			transformerNotationHighlight(),
			transformerNotationWordHighlight(),
			transformerNotationErrorLevel(),
		],
		config: (md) => {
			md.use(InlineLinkPreviewElementTransform);
		},
	},
	cleanUrls: true,
	lastUpdated: true,
});

function movePlugin(
	plugins: { name: string }[],
	pluginAName: string,
	order: "before" | "after",
	pluginBName: string,
) {
	const pluginBIndex = plugins.findIndex((p) => p.name === pluginBName);
	if (pluginBIndex === -1) return;

	const pluginAIndex = plugins.findIndex((p) => p.name === pluginAName);
	if (pluginAIndex === -1) return;

	if (order === "before" && pluginAIndex > pluginBIndex) {
		const pluginA = plugins.splice(pluginAIndex, 1)[0];
		plugins.splice(pluginBIndex, 0, pluginA);
	}

	if (order === "after" && pluginAIndex < pluginBIndex) {
		const pluginA = plugins.splice(pluginAIndex, 1)[0];
		plugins.splice(pluginBIndex, 0, pluginA);
	}
}
