import React, { useState } from "react";
import toast from "react-hot-toast";
import type { NavigateFunction } from "react-router";
import { BASE_URL } from "../../lib/api";
import type { EventFormData } from "./constants";

export function useSaveEvent(opts: {
	formData: EventFormData;
	isFree: boolean;
	editId: string | null;
	existingEvent: any;
	accessToken: string | null | undefined;
	uploadImages: (eventId: string) => Promise<void>;
	navigate: NavigateFunction;
}) {
	const { formData, isFree, editId, existingEvent, accessToken, uploadImages, navigate } = opts;
	const [submitting, setSubmitting] = useState(false);
	const todayStr = new Date().toISOString().slice(0, 10);

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization:  `Bearer ${accessToken}`,
	});

	const buildPayload = () => ({
		title:            formData.title,
		category:         formData.category,
		description:      formData.description,
		date:             formData.date,
		location:         formData.location,
		price:            isFree ? 0 : Number(formData.price),
		capacity:         Number(formData.capacity),
		currency:         formData.currency || "INR",
		visibility:       formData.visibility,
		isTeamEvent:      formData.isTeamEvent,
		minTeamSize:      formData.isTeamEvent && formData.minTeamSize ? Number(formData.minTeamSize) : null,
		maxTeamSize:      formData.isTeamEvent && formData.maxTeamSize ? Number(formData.maxTeamSize) : null,
		teamCapacityMode: formData.isTeamEvent ? formData.teamCapacityMode : null,
	});

	const handleSaveDraft = async (e: React.MouseEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = {
				...buildPayload(),
				date:     formData.date     || todayStr,
				location: formData.location || "TBD",
				capacity: Number(formData.capacity) || 1,
			};
			let savedId: string;

			if (editId && existingEvent) {
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "PATCH", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				savedId = editId;
			} else {
				const res = await fetch(`${BASE_URL}/events`, {
					method: "POST", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				const created = await res.json();
				savedId = created.id;
			}

			await uploadImages(savedId);
			toast.success("Draft saved.");
			navigate("/dashboard");
		} catch (err: any) {
			toast.error(err?.message || "Could not save draft.");
		} finally {
			setSubmitting(false);
		}
	};

	const handlePublish = async (e: React.MouseEvent | React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = buildPayload();
			let eventId: string;

			if (editId && existingEvent) {
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "PATCH", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				eventId = editId;
			} else {
				const eligRes = await fetch(`${BASE_URL}/events/can-publish`, {
					headers: authHeaders(), credentials: "include",
				});
				if (eligRes.ok) {
					const { allowed } = await eligRes.json();
					if (!allowed) {
						toast.error("You've reached your plan's event limit. Upgrade to publish more.");
						return;
					}
				}

				const res = await fetch(`${BASE_URL}/events`, {
					method: "POST", headers: authHeaders(), credentials: "include",
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error((await res.json()).message);
				const created = await res.json();
				eventId = created.id;
			}

			// TODO: cancel event image publish if tier limit exceeded at this stage
			await uploadImages(eventId);

			const pubRes = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
				method: "POST", headers: authHeaders(), credentials: "include",
			});
			if (!pubRes.ok) {
				const err = await pubRes.json();
				toast.error(
					err.message === "TIER_LIMIT_EXCEEDED"
						? "You've reached your plan's event limit. Upgrade to publish more."
						: err.message || "Could not publish.",
				);
				return;
			}

			const published = await pubRes.json();
			if (published.status === "PENDING") {
				toast.success("Your event has been submitted for admin review. You'll be notified once it's approved.", { duration: 7000 });
				navigate("/dashboard");
			} else if (published.status === "APPROVED") {
				toast.success("Your event is live!!", { duration: 4000 });
				navigate(`/events/${eventId}`);
			} else {
				toast.success("Event submitted.");
				navigate("/dashboard");
			}
		} catch (err: any) {
			toast.error(err?.message || "Could not publish.");
		} finally {
			setSubmitting(false);
		}
	};

	return { submitting, handleSaveDraft, handlePublish, todayStr };
}
