// A tiny escaping HTML template tag. Interpolated values are escaped unless
// they are already `Raw` (the result of another `html` call or `raw()`).

export class Raw {
	readonly value: string;
	constructor(value: string) {
		this.value = value;
	}
	toString(): string {
		return this.value;
	}
}

export const raw = (value: string): Raw => new Raw(value);

export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

type Value = Raw | string | number | boolean | null | undefined | Value[];

function render(value: Value): string {
	if (value === null || value === undefined || value === false || value === true) return "";
	if (value instanceof Raw) return value.value;
	if (Array.isArray(value)) return value.map(render).join("");
	return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Value[]): Raw {
	let out = strings[0] ?? "";
	values.forEach((value, i) => {
		out += render(value) + (strings[i + 1] ?? "");
	});
	return new Raw(out);
}

/** Text that may be a "TODO: …" placeholder; TODOs render as a visible marker. */
export function text(value: string): Raw {
	return isTodo(value) ? html`<span class="todo">${value}</span>` : html`${value}`;
}

export const isTodo = (value: string): boolean => /^\s*TODO:/.test(value);

/** Two-digit sheet or figure number: 3 → "03". */
export const pad = (n: number): string => String(n).padStart(2, "0");
