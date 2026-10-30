import { createHash } from "node:crypto";

/**
 * Runs before first paint so a visitor who chose dark mode never sees a white
 * flash. It is inline, so the Content-Security-Policy allows it by hash.
 */
export const THEME_SCRIPT =
	'try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}';

export const THEME_SCRIPT_HASH = `sha256-${createHash("sha256").update(THEME_SCRIPT).digest("base64")}`;
