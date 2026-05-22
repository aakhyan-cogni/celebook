interface FieldErrorProps {
	message?: string;
	id?: string;
}

export default function FieldError({ message, id }: FieldErrorProps) {
	if (!message) return null;
	return (
		<div id={id} className="invalid-feedback d-block small mt-1" role="alert">
			{message}
		</div>
	);
}
