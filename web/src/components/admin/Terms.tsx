import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { fetchTerms, updateTerms } from "../../api/terms.api";

const TOOLBAR_BTN = "btn btn-sm btn-outline-secondary me-1 mb-1";

export default function Terms() {
	const [originalVersion, setOriginalVersion] = useState("");
	const [version, setVersion] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
		],
		content: "",
	});

	useEffect(() => {
		let cancelled = false;
		fetchTerms()
			.then((data) => {
				if (cancelled) return;
				setOriginalVersion(data.version);
				setVersion(data.version);
				editor?.commands.setContent(data.content || "");
			})
			.catch((err) => toast.error(err?.message || "Failed to load terms"))
			.finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [editor]);

	const trimmedVersion = version.trim();
	const isVersionInvalid = trimmedVersion === "" || trimmedVersion === originalVersion;
	const hasContent = (editor?.getText() ?? "").trim().length > 0;
	const canSave = !isVersionInvalid && hasContent && !saving;

	async function onConfirmSave() {
		if (!editor) return;
		setSaving(true);
		try {
			const updated = await updateTerms({
				version: trimmedVersion,
				content: editor.getHTML(),
			});
			setOriginalVersion(updated.version);
			setVersion(updated.version);
			editor.commands.setContent(updated.content || "");
			toast.success(`Published version ${updated.version}`);
			setShowConfirm(false);
		} catch (error: any) {
			toast.error(error?.message || "Failed to publish terms");
		} finally {
			setSaving(false);
		}
	}

	if (loading || !editor) {
		return (
			<div className="text-center py-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading…</span>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="d-flex align-items-center justify-content-between mb-4">
				<div>
					<h4 className="fw-bold mb-1">Terms &amp; Conditions</h4>
					<p className="text-muted small mb-0">
						Currently live: <span className="badge bg-primary-subtle text-primary-emphasis">v{originalVersion}</span>
					</p>
				</div>
				<button
					className="btn btn-primary"
					disabled={!canSave}
					onClick={() => setShowConfirm(true)}
				>
					Publish new version
				</button>
			</div>

			<div className="mb-3">
				<label htmlFor="terms-version" className="form-label fw-semibold">
					New version
				</label>
				<input
					id="terms-version"
					type="text"
					className={`form-control ${trimmedVersion && trimmedVersion === originalVersion ? "is-invalid" : ""}`}
					value={version}
					onChange={(e) => setVersion(e.target.value)}
					placeholder="e.g. v1.1"
				/>
				{trimmedVersion && trimmedVersion === originalVersion && (
					<div className="invalid-feedback d-block">
						New version must differ from current ({originalVersion}).
					</div>
				)}
				<div className="form-text">
					Publishing forces every user to re-accept on their next mutating action.
				</div>
			</div>

			<label className="form-label fw-semibold">Content</label>
			<div className="border rounded-3 p-2 mb-2 bg-body-tertiary d-flex flex-wrap">
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("bold") ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("italic") ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<em>I</em>
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				>
					H1
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				>
					H2
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				>
					H3
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("bulletList") ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					• List
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("orderedList") ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					1. List
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("blockquote") ? "active" : ""}`}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				>
					“ Quote
				</button>
				<button
					type="button"
					className={`${TOOLBAR_BTN} ${editor.isActive("link") ? "active" : ""}`}
					onClick={() => {
						const previous = editor.getAttributes("link").href ?? "";
						const url = window.prompt("Enter URL (https/mailto)", previous);
						if (url === null) return;
						if (url === "") {
							editor.chain().focus().extendMarkRange("link").unsetLink().run();
							return;
						}
						editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
					}}
				>
					🔗 Link
				</button>
				<button
					type="button"
					className={TOOLBAR_BTN}
					onClick={() => editor.chain().focus().unsetLink().run()}
					disabled={!editor.isActive("link")}
				>
					Unlink
				</button>
				<div className="vr mx-2"></div>
				<button
					type="button"
					className={TOOLBAR_BTN}
					onClick={() => editor.chain().focus().undo().run()}
				>
					↶ Undo
				</button>
				<button
					type="button"
					className={TOOLBAR_BTN}
					onClick={() => editor.chain().focus().redo().run()}
				>
					↷ Redo
				</button>
			</div>
			<div className="border rounded-3 p-3 mb-3 tiptap-host" style={{ minHeight: 320 }}>
				<EditorContent editor={editor} />
			</div>

			<Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Publish new T&amp;C version?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p className="mb-2">
						You're about to publish <strong>v{trimmedVersion}</strong> (currently live:{" "}
						<strong>v{originalVersion}</strong>).
					</p>
					<p className="text-muted small mb-0">
						Every user will be prompted to re-accept on their next mutating action. This cannot be
						undone — you'll need to publish another version to roll back.
					</p>
				</Modal.Body>
				<Modal.Footer>
					<button className="btn btn-outline-secondary" onClick={() => setShowConfirm(false)} disabled={saving}>
						Cancel
					</button>
					<button className="btn btn-primary" onClick={onConfirmSave} disabled={saving}>
						{saving ? "Publishing…" : "Yes, publish"}
					</button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}
