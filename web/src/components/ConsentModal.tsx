import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import { acceptConsent } from "../api/consent.api";
import { fetchTerms, type TermsDoc } from "../api/terms.api";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";

export default function ConsentModal() {
	const consentRequired = useAuthStore((s) => s.consentRequired);
	const setConsentRequired = useAuthStore((s) => s.setConsentRequired);
	const pendingRequest = useAuthStore((s) => s.pendingRequest);
	const setPendingRequest = useAuthStore((s) => s.setPendingRequest);
	const updateUser = useAuthStore((s) => s.updateUser);

	const [terms, setTerms] = useState<TermsDoc | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
	const [isAccepting, setIsAccepting] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!consentRequired) return;
		const block = (e: KeyboardEvent) => {
			if (e.key === "Escape") e.preventDefault();
		};
		document.addEventListener("keydown", block, true);
		return () => document.removeEventListener("keydown", block, true);
	}, [consentRequired]);

	useEffect(() => {
		if (!consentRequired) {
			setTerms(null);
			setHasScrolledToBottom(false);
			setLoadError(null);
			return;
		}
		loadTerms();
	}, [consentRequired]);

	async function loadTerms() {
		setIsLoading(true);
		setLoadError(null);
		try {
			const data = await fetchTerms();
			setTerms(data);
		} catch (error: any) {
			setLoadError(error?.message || "Failed to load Terms & Conditions.");
		} finally {
			setIsLoading(false);
		}
	}

	if (!consentRequired) return null;

	function handleScroll() {
		const el = scrollRef.current;
		if (!el) return;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
			setHasScrolledToBottom(true);
		}
	}

	async function handleAccept() {
		setIsAccepting(true);
		try {
			await acceptConsent();
			try {
				const data = await apiFetch("/auth/me", { method: "GET" });
				if (data?.user) updateUser({ ...data.user });
			} catch {
				// Non-critical — store will reconcile on next hydrate.
			}
			setConsentRequired(false);
			if (pendingRequest) {
				setPendingRequest(null);
				await pendingRequest();
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to accept Terms & Conditions. Please try again.");
		} finally {
			setIsAccepting(false);
		}
	}

	const sanitizedContent = terms?.content ? DOMPurify.sanitize(terms.content, { USE_PROFILES: { html: true } }) : "";

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="consent-modal-title"
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				backgroundColor: "rgba(0,0,0,0.75)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
			}}
		>
			<div
				className="card shadow-lg border-0 rounded-4 bg-body"
				style={{
					width: "100%",
					maxWidth: "640px",
					maxHeight: "90vh",
					display: "flex",
					flexDirection: "column",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="card-header border-0 bg-primary text-white rounded-top-4 p-4">
					<h4 className="mb-0 fw-bold" id="consent-modal-title">
						Terms &amp; Conditions Update
					</h4>
					<p className="mb-0 small opacity-75 mt-1">
						Please read and accept our updated Terms &amp; Conditions to continue.
						{terms?.version && <span className="ms-2">Version {terms.version}</span>}
					</p>
				</div>

				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className="card-body overflow-auto p-4"
					style={{ flex: 1 }}
				>
					{isLoading && (
						<div className="text-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading…</span>
							</div>
							<p className="text-muted small mt-3 mb-0">Loading latest terms…</p>
						</div>
					)}

					{loadError && !isLoading && (
						<div className="text-center py-5">
							<p className="text-danger small mb-3">{loadError}</p>
							<button onClick={loadTerms} className="btn btn-outline-primary btn-sm">
								Retry
							</button>
						</div>
					)}

					{!isLoading && !loadError && terms && (
						<div className="consent-content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
					)}
				</div>

				<div className="card-footer border-0 bg-body-tertiary rounded-bottom-4 p-4">
					{!hasScrolledToBottom && !loadError && !isLoading && (
						<p className="text-muted small text-center mb-3">
							Scroll to the bottom to enable the Accept button.
						</p>
					)}
					<button
						onClick={handleAccept}
						disabled={!hasScrolledToBottom || isAccepting || !terms}
						className="btn btn-primary w-100 btn-lg rounded-pill shadow"
					>
						{isAccepting ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								/>
								Saving...
							</>
						) : (
							"I Accept the Terms & Conditions"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
