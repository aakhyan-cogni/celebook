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
					className="border border-2 border-dashed rounded-3 p-3 text-center"
					style={{ borderColor: "var(--bs-primary)", cursor: "pointer", borderStyle: "dashed" }}
					onClick={() => fileInputRef.current?.click()}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => { e.preventDefault(); onSelect(e.dataTransfer.files); }}
				>
					<p className="mb-0 small text-body-secondary">Drag & drop or <span className="text-primary fw-bold">browse</span></p>
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

			{imagePreviews.length > 0 && (
				<div className="d-flex flex-wrap gap-2 mt-2">
					{imagePreviews.map((src, i) => (
						<div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
							<img src={src} alt={`preview-${i}`} className="rounded-3 object-fit-cover w-100 h-100" style={{ objectFit: "cover" }} />
							<button type="button" onClick={() => onRemoveNew(i)} className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1" style={{ width: 20, height: 20, fontSize: 12 }}>×</button>
						</div>
					))}
				</div>
			)}

			{existingUrls.length > 0 && (
				<div className="d-flex flex-wrap gap-2 mt-2">
					{existingUrls.map((url, i) => (
						<div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
							<img src={`http://localhost:5000${url}`} alt={`saved-${i}`} className="rounded-3 w-100 h-100" style={{ objectFit: "cover" }} />
							{editId && (
								<button type="button" onClick={() => onRemoveExisting(url, editId)} className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1" style={{ width: 20, height: 20, fontSize: 12 }}>×</button>
							)}
						</div>
					))}
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
