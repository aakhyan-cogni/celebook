import type { User } from "../store/useAuthStore";

export function Avatar({ user }: AvatarProps) {
	return (
		<img
			src={`http://localhost:5000/uploads/avatars/${user.avatar}`}
			className="img-fluid rounded-circle"
			style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
			alt="profile"
		/>
	);
}

interface AvatarProps {
	user: User;
}
