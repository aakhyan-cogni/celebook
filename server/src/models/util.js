export function fromDoc(doc) {
	if (!doc) return null;
	const { _id, __v, ...rest } = doc;
	return { id: _id?.toString() ?? "", ...rest };
}
