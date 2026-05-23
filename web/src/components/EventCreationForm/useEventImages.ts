import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { BASE_URL } from "../../lib/api";
import { ACCEPTED_TYPES } from "./constants";

export function useEventImages(opts: {
	imageLimit: number;
	userTier: string;
	accessToken: string | null | undefined;
	existingUrls: string[];
	setExistingUrls: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	const { imageLimit, userTier, accessToken, existingUrls, setExistingUrls } = opts;
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [imageError, setImageError] = useState("");
	const [uploading, setUploading] = useState(false);
	const uploadingRef = useRef(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageSelect = (files: FileList | null) => {
		if (!files) return;
		setImageError("");
		const newFiles = Array.from(files);

		const invalid = newFiles.filter((f) => !ACCEPTED_TYPES.includes(f.type));
		if (invalid.length) {
			setImageError("Only JPEG, PNG, and WebP images are allowed.");
			return;
		}

		const tooBig = newFiles.filter((f) => f.size > 5 * 1024 * 1024);
		if (tooBig.length) {
			setImageError("Each image must be under 5 MB.");
			return;
		}

		if (existingUrls.length + imageFiles.length + newFiles.length > imageLimit) {
			setImageError(`Your ${userTier} plan allows at most ${imageLimit} image(s).`);
			return;
		}

		setImageFiles((prev) => [...prev, ...newFiles]);
		const previews = newFiles.map((f) => URL.createObjectURL(f));
		setImagePreviews((prev) => [...prev, ...previews]);
	};

	const removeNewImage = (index: number) => {
		URL.revokeObjectURL(imagePreviews[index]);
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
		setImagePreviews((prev) => prev.filter((_, i) => i !== index));
		setImageError("");
	};

	const removeExistingImage = async (url: string, eventId: string) => {
		try {
			const res = await fetch(`${BASE_URL}/events/${eventId}/images`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
				credentials: "include",
				body: JSON.stringify({ url }),
			});
			if (!res.ok) {
				toast.error("Could not remove image.");
				return;
			}
			setExistingUrls((prev) => prev.filter((u) => u !== url));
		} catch {
			toast.error("Could not remove image.");
		}
	};

	const uploadImages = async (eventId: string): Promise<void> => {
		if (imageFiles.length === 0) return;

		if (uploadingRef.current) return;
		uploadingRef.current = true;
		setUploading(true);
		try {
			const fd = new FormData();
			imageFiles.forEach((f) => fd.append("images", f));
			const res = await fetch(`${BASE_URL}/events/${eventId}/images`, {
				method: "POST",
				headers: { Authorization: `Bearer ${accessToken}` },
				credentials: "include",
				body: fd,
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || "Image upload failed.");
			}
		} finally {
			uploadingRef.current = false;
			setUploading(false);
		}
	};

	return {
		imageFiles,
		imagePreviews,
		imageError,
		uploading,
		fileInputRef,
		handleImageSelect,
		removeNewImage,
		removeExistingImage,
		uploadImages,
		totalImageCount: existingUrls.length + imageFiles.length,
	};
}
