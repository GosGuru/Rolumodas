import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Safely convert a variant option (which may be a string or object) to a user-facing text
export function toVariantLabel(option) {
	if (option === null || option === undefined) return '';
	const t = typeof option;
	if (t === 'string' || t === 'number' || t === 'boolean') return String(option);
	if (t === 'object') {
		// Prefer explicit textual fields
		if (typeof option.label === 'string' && option.label.trim()) return option.label;
		if (typeof option.name === 'string' && option.name.trim()) return option.name;
		if (typeof option.value === 'string' && option.value.trim()) return option.value;
		// Colors often come as hex
		if (typeof option.hex === 'string' && option.hex.trim()) return option.hex;
		// Fallback: first primitive value
		for (const v of Object.values(option)) {
			if (['string', 'number', 'boolean'].includes(typeof v)) return String(v);
		}
		try {
			return JSON.stringify(option);
		} catch {
			return '';
		}
	}
	return '';
}

// Normalize a selectedVariants dictionary to ensure all values are strings (labels)
export function normalizeSelectedVariants(selectedVariants) {
	if (!selectedVariants || typeof selectedVariants !== 'object') return {};
	return Object.fromEntries(
		Object.entries(selectedVariants).map(([k, v]) => [k, toVariantLabel(v)])
	);
}
