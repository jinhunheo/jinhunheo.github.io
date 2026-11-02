// Progressive enhancement only: every page works without this file.

// Image viewer (photos and CAD, not videos): figures become buttons that open the image full-screen,
// in colour, in a native <dialog>. Arrow keys step through figures.
function setupViewer(): void {
	const plates = [...document.querySelectorAll<HTMLElement>("[data-viewer] .plate:not(.plate--video)")];
	if (!plates.length || typeof HTMLDialogElement !== "function") return;

	const dialog = document.createElement("dialog");
	dialog.className = "viewer";
	dialog.setAttribute("aria-label", "Figure viewer");
	dialog.innerHTML = `
		<figure class="viewer__figure">
			<img class="viewer__img" alt="">
			<figcaption class="viewer__caption"></figcaption>
		</figure>
		<div class="viewer__bar mono">
			<button type="button" class="viewer__btn" data-step="-1" aria-label="Previous figure">Prev</button>
			<span class="viewer__count" aria-live="polite"></span>
			<button type="button" class="viewer__btn" data-step="1" aria-label="Next figure">Next</button>
			<button type="button" class="viewer__btn viewer__close" aria-label="Close figure viewer">Close</button>
		</div>`;
	document.body.append(dialog);

	const img = dialog.querySelector<HTMLImageElement>(".viewer__img")!;
	const caption = dialog.querySelector<HTMLElement>(".viewer__caption")!;
	const count = dialog.querySelector<HTMLElement>(".viewer__count")!;
	let current = 0;

	// The smallest file that still fills the screen, in the format the browser
	// already picked for the inline image (AVIF where supported).
	const fullSize = (source: HTMLImageElement): string => {
		const avif = source.currentSrc.endsWith(".avif");
		const set = avif ? (source.parentElement?.querySelector("source")?.srcset ?? "") : source.srcset;
		const candidates = set
			.split(",")
			.map((c) => c.trim().split(/\s+/))
			.map(([url, w]) => ({ url: url ?? "", width: parseInt(w ?? "0") }))
			.sort((a, b) => a.width - b.width);
		const needed = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio;
		return (candidates.find((c) => c.width >= needed) ?? candidates.at(-1))?.url || source.currentSrc;
	};

	const show = (index: number): void => {
		current = (index + plates.length) % plates.length;
		const plate = plates[current]!;
		const source = plate.querySelector("img")!;
		img.src = fullSize(source);
		img.alt = source.alt;
		caption.textContent = plate.querySelector("figcaption")?.textContent?.trim() ?? "";
		count.textContent = `${current + 1} / ${plates.length}`;
	};

	plates.forEach((plate, index) => {
		const frame = plate.querySelector<HTMLElement>(".plate__frame");
		if (!frame) return;
		const button = document.createElement("button");
		button.type = "button";
		button.className = "plate__open";
		const label = plate.querySelector("figcaption")?.textContent?.trim() ?? "figure";
		button.setAttribute("aria-label", `Enlarge ${label}`);
		button.addEventListener("click", () => {
			show(index);
			dialog.showModal();
		});
		frame.append(button);
	});

	dialog.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;
		const step = target.closest<HTMLElement>("[data-step]")?.dataset.step;
		if (step) show(current + Number(step));
		else if (target.closest(".viewer__close") || target === dialog) dialog.close();
	});
	dialog.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight") show(current + 1);
		if (event.key === "ArrowLeft") show(current - 1);
	});
}

// Light/dark toggle in the header. The choice is remembered in this browser;
// the inline script in <head> applies it before first paint.
function setupTheme(): void {
	const button = document.querySelector<HTMLButtonElement>(".theme-toggle");
	if (!button) return;
	const root = document.documentElement;
	const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	const apply = (dark: boolean): void => {
		if (dark) root.dataset.theme = "dark";
		else delete root.dataset.theme;
		button.setAttribute("aria-pressed", String(dark));
		themeColor?.setAttribute("content", dark ? "#0f0f10" : "#ffffff");
	};
	apply(root.dataset.theme === "dark");
	button.hidden = false;
	button.addEventListener("click", () => {
		const dark = root.dataset.theme !== "dark";
		apply(dark);
		try {
			localStorage.setItem("theme", dark ? "dark" : "light");
		} catch {
			// Storage blocked (private mode): the toggle still works for this page.
		}
	});
}

// Footer mail icon: copies the address, then the mailto link opens the mail app.
function setupEmailCopy(): void {
	const toast = document.querySelector<HTMLElement>(".toast");
	let timer = 0;
	for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-copy-email]")) {
		link.addEventListener("click", () => {
			const email = link.dataset.copyEmail ?? "";
			navigator.clipboard?.writeText(email).then(
				() => {
					if (!toast) return;
					toast.textContent = `Copied ${email}`;
					toast.classList.add("is-visible");
					window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						toast.classList.remove("is-visible");
						toast.textContent = "";
					}, 2500);
				},
				() => {},
			);
		});
	}
}

setupTheme();
setupViewer();
setupEmailCopy();
