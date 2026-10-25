import { Marked, type Token } from "marked";
import { raw, type Raw } from "./html.ts";

const marked = new Marked({ gfm: true, async: false });

/** Inline TODOs inside Markdown become the same visible marker as in templates. */
const markTodos = (htmlText: string): string =>
	htmlText.replace(/TODO:[^<]*/g, (m) => `<span class="todo">${m.trim()}</span>`);

export function markdown(source: string): Raw {
	return raw(markTodos(marked.parse(source) as string));
}

export function inlineMarkdown(source: string): Raw {
	return raw(markTodos(marked.parseInline(source) as string));
}

export interface MarkdownSection {
	heading: string;
	id: string;
	body: Raw;
}

const slugify = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

/**
 * Splits a Markdown document at its `##` headings so each section can be laid
 * out on the sheet grid (heading in the margin, body in the main columns).
 */
export function markdownSections(source: string): MarkdownSection[] {
	const sections: { heading: string; tokens: Token[] }[] = [];
	for (const token of marked.lexer(source)) {
		if (token.type === "heading" && token.depth === 2) {
			sections.push({ heading: token.text, tokens: [] });
		} else {
			if (sections.length === 0) sections.push({ heading: "", tokens: [] });
			sections.at(-1)?.tokens.push(token);
		}
	}
	return sections.map((s) => {
		const tokens = Object.assign(s.tokens, { links: {} });
		return {
			heading: s.heading,
			id: slugify(s.heading),
			body: raw(markTodos(marked.parser(tokens))),
		};
	});
}
