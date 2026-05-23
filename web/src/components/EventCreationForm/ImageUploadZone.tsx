import { useRef, useState } from "react";
import { SERVER_ORIGIN } from "../../lib/api";

interface ImageUploadZoneProps {
	totalImageCount: number;
	imageLimit: number;
	userTier: string;
	imageFiles: File[];
	imagePreviews: string[];
	existingUrls: string[];
	imageError: string;
	uploading: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	editId: string | null;
	onSelect: (files: FileList | null) => void;
	onRemoveNew: (index: number) => void;
	onRemoveExisting: (url: string, eventId: string) => void;
}

export default function ImageUploadZone({
	totalImageCount,
	imageLimit,
	userTier,
	imagePreviews,
	existingUrls,
	imageError,
	uploading,
	fileInputRef,
	editId,
	onSelect,
	onRemoveNew,
	onRemoveExisting,
}: ImageUploadZoneProps) {
	const allImages = [
		...existingUrls.map((url, i) => ({ src: `${SERVER_ORIGIN}${url}`, type: "existing" as const, index: i, url })),
		...imagePreviews.map((src, i) => ({ src, type: "new" as const, index: i, url: "" })),
	];

	const [activeIdx, setActiveIdx] = useState(0);
	const clampedActive = Math.min(activeIdx, Math.max(0, allImages.length - 1));
	const dragStart = useRef<number | null>(null);

	const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
	const next = () => setActiveIdx((i) => Math.min(allImages.length - 1, i + 1));
	const onDragStart = (clientX: number) => {
		dragStart.current = clientX;
	};
	const onDragEnd = (clientX: number) => {
		if (dragStart.current === null) return;
		const delta = dragStart.current - clientX;
		if (delta > 40) next();
		if (delta < -40) prev();
		dragStart.current = null;
	};

	return (
		<div className="mb-3">
			<label className="form-label fw-semibold">
				Event Images{" "}
				<span className="text-body-secondary fw-normal small">
					({totalImageCount}/{imageLimit} — {userTier} plan)
				</span>
			</label>

			{totalImageCount < imageLimit && (
				<div
					className="border border-2 rounded-3 p-3 text-center mb-2"
					style={{ borderColor: "var(--bs-primary)", cursor: "pointer", borderStyle: "dashed" }}
					onClick={() => fileInputRef.current?.click()}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						onSelect(e.dataTransfer.files);
					}}
				>
					<p className="mb-0 small text-body-secondary">
						Drag & drop or <span className="text-primary fw-bold">browse</span>
					</p>
					<p className="mb-0 small text-body-secondary">JPEG, PNG, WebP — max 5 MB each</p>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						className="d-none"
						onChange={(e) => onSelect(e.target.files)}
					/>
				</div>
			)}

			{imageError && <div className="text-danger small mt-1">{imageError}</div>}

			{allImages.length > 0 && (
				<div className="mt-2">
					{/* Main viewer */}
					<div
						className="position-relative rounded-3 overflow-hidden"
						style={{
							width: "100%",
							aspectRatio: "16/9",
							background: "var(--bs-secondary-bg)",
							userSelect: "none",
						}}
						onMouseDown={(e) => onDragStart(e.clientX)}
						onMouseUp={(e) => onDragEnd(e.clientX)}
						onMouseLeave={() => {
							dragStart.current = null;
						}}
						onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
						onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
					>
						<img
							src={allImages[clampedActive].src}
							alt={`event-img-${clampedActive}`}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								display: "block",
								pointerEvents: "none",
								transition: "opacity 0.2s",
							}}
							draggable={false}
						/>

						{/* Remove button */}
						<button
							type="button"
							className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-pill"
							style={{ fontSize: 11, padding: "2px 8px", zIndex: 5 }}
							onClick={(e) => {
								e.stopPropagation();
								const img = allImages[clampedActive];
								if (img.type === "existing" && editId) onRemoveExisting(img.url, editId);
								else onRemoveNew(img.index);
								setActiveIdx((i) => Math.max(0, i - 1));
							}}
						>
							✕ Remove
						</button>

						{/* Arrows */}
						{allImages.length > 1 && (
							<>
								<button
									type="button"
									className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-0"
									style={{
										width: 32,
										height: 32,
										fontSize: 14,
										opacity: clampedActive === 0 ? 0.3 : 0.8,
										zIndex: 5,
									}}
									onClick={(e) => {
										e.stopPropagation();
										prev();
									}}
									disabled={clampedActive === 0}
								>
									‹
								</button>
								<button
									type="button"
									className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-0"
									style={{
										width: 32,
										height: 32,
										fontSize: 14,
										opacity: clampedActive === allImages.length - 1 ? 0.3 : 0.8,
										zIndex: 5,
									}}
									onClick={(e) => {
										e.stopPropagation();
										next();
									}}
									disabled={clampedActive === allImages.length - 1}
								>
									›
								</button>
								<span
									className="position-absolute bottom-0 start-50 translate-middle-x mb-2 badge bg-dark bg-opacity-75 rounded-pill"
									style={{ fontSize: 11 }}
								>
									{clampedActive + 1} / {allImages.length}
								</span>
							</>
						)}
					</div>

					{/* Thumbnail strip */}
					{allImages.length > 1 && (
						<div className="d-flex gap-2 mt-2 pb-1" style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
							{allImages.map((img, i) => (
								<div
									key={i}
									onClick={() => setActiveIdx(i)}
									className="flex-shrink-0 rounded-2 overflow-hidden"
									style={{
										width: 56,
										height: 56,
										cursor: "pointer",
										outline:
											i === clampedActive
												? "2.5px solid var(--bs-primary)"
												: "2px solid transparent",
										transition: "outline 0.15s",
									}}
								>
									<img
										src={img.src}
										alt={`thumb-${i}`}
										draggable={false}
										style={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{uploading && (
				<div className="small text-primary mt-1">
					<span className="spinner-border spinner-border-sm me-1" role="status" />
					Uploading images...
				</div>
			)}
		</div>
	);
}
