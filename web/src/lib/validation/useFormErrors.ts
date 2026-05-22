import { useState, useCallback } from "react";
import type { ZodSchema } from "zod";

export type FieldErrors = Record<string, string>;

function flatten(error: any): FieldErrors {
	const out: FieldErrors = {};
	if (!error?.issues) return out;
	for (const issue of error.issues) {
		const key = issue.path.join(".") || "_form";
		if (!out[key]) out[key] = issue.message;
	}
	return out;
}

export function useFormErrors<T>(schema: ZodSchema<T>) {
	const [errors, setErrors] = useState<FieldErrors>({});

	const validate = useCallback(
		(data: unknown): { ok: true; data: T } | { ok: false; errors: FieldErrors } => {
			const result = schema.safeParse(data);
			if (result.success) {
				setErrors({});
				return { ok: true, data: result.data };
			}
			const flat = flatten(result.error);
			setErrors(flat);
			return { ok: false, errors: flat };
		},
		[schema],
	);

	const validateField = useCallback(
		(name: string, data: unknown) => {
			const result = schema.safeParse(data);
			if (result.success) {
				setErrors((prev) => {
					if (!prev[name]) return prev;
					const { [name]: _, ...rest } = prev;
					return rest;
				});
				return true;
			}
			const flat = flatten(result.error);
			setErrors((prev) => ({ ...prev, [name]: flat[name] || "" }));
			return !flat[name];
		},
		[schema],
	);

	const clear = useCallback((name?: string) => {
		if (!name) {
			setErrors({});
			return;
		}
		setErrors((prev) => {
			if (!prev[name]) return prev;
			const { [name]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const setError = useCallback((name: string, message: string) => {
		setErrors((prev) => ({ ...prev, [name]: message }));
	}, []);

	return { errors, validate, validateField, clear, setError, setErrors };
}
