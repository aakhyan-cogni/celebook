import { useState } from "react";

interface StarRatingProps {
	value: number;
	onChange?: (value: number) => void;
	readonly?: boolean;
	size?: number;
}

export default function StarRating({ value, onChange, readonly, size = 30 }: StarRatingProps) {
	const [hover, setHover] = useState<number | null>(null);
	const display = hover ?? value;
	const arr = [1, 2, 3, 4, 5];

	const handleClick = (star: number) => {
		if (readonly || !onChange) return;
		if (star === value) onChange(star - 0.5);
		else onChange(star);
	};

	return (
		<div>
			{arr.map((star) => {
				const isFull = star <= display;
				const isHalf = star - 0.5 === display;

				return (
					<span
						key={star}
						onClick={() => handleClick(star)}
						onMouseEnter={() => !readonly && setHover(star)}
						onMouseLeave={() => !readonly && setHover(null)}
						style={{
							cursor: readonly ? "default" : "pointer",
							fontSize: size,
							color: isFull ? "gold" : isHalf ? "palegoldenrod" : "grey",
						}}
					>
						★
					</span>
				);
			})}
		</div>
	);
}
