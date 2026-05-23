import type { User } from "../store/useAuthStore";
import { getAvatarUrl } from "../lib/api";

export function Avatar({ user }: AvatarProps) {
	return (
		<img
			src={getAvatarUrl(user.avatar)}
			className="img-fluid rounded-circle"
			style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
			alt="profile"
		/>
	);
}

interface AvatarProps {
	user: User;
}
