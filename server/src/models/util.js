export function fromDoc(doc) {
	if (!doc) return null;
	const { _id, __v, ...rest } = doc; // what are we doing here is that we are removing the _id and __v fields from the document and returning the rest of the fields as an object with an id field that is the string representation of the _id field	
	return { id: _id?.toString() ?? "", ...rest }; // returning same object but with id instead of _id and without __v
}
