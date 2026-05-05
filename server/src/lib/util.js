export function excludeFields(obj, fields) {
	const result = { ...obj };
	for (const field of fields) {
		delete result[field];
	}
	return result;
}
