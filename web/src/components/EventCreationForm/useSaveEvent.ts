import React, { useRef, useState } from "react";
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

	const createdEventIdRef = useRef<string | null>(null);

	const authHeaders = () => ({
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
	});

	const toIsoUtc = (dateStr: string, timeStr: string) => {
		const safeTime = timeStr || "00:00";
		const d = new Date(`${dateStr}T${safeTime}:00`);
		return d.toISOString();
	};

	const buildPayload = () => {
		const combinedDate = formData.date ? toIsoUtc(formData.date, formData.time) : "";

		let combinedEnd: string | null = null;
		if (formData.endDate) {
			combinedEnd = toIsoUtc(formData.endDate, formData.endTime || formData.time || "00:00");
		} else if (formData.endTime && formData.date) {
			combinedEnd = toIsoUtc(formData.date, formData.endTime);
		}

		return {
			title: formData.title,
			category: formData.category,
			description: formData.description,
			date: combinedDate,
			endDate: combinedEnd,
			location: formData.location,
			price: isFree ? 0 : Number(formData.price),
			capacity: Number(formData.capacity),
			currency: formData.currency || "INR",
			visibility: formData.visibility,
		};
	};

	const resolveEventId = async (payload: object): Promise<string> => {
		if (editId && existingEvent) {
			const res = await fetch(`${BASE_URL}/events/${editId}`, {
				method: "PATCH",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			return editId;
		}

		if (createdEventIdRef.current) {
			const res = await fetch(`${BASE_URL}/events/${createdEventIdRef.current}`, {
				method: "PATCH",
				headers: authHeaders(),
				credentials: "include",
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error((await res.json()).message);
			return createdEventIdRef.current;
		}

		const res = await fetch(`${BASE_URL}/events`, {
			method: "POST",
			headers: authHeaders(),
			credentials: "include",
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error((await res.json()).message);
		const created = await res.json();
		createdEventIdRef.current = created.id;
		return created.id;
	};

	const handleSaveDraft = async (e: React.MouseEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const payload = {
				...buildPayload(),

				date: formData.date ? toIsoUtc(formData.date, formData.time) : new Date().toISOString(),
				location: formData.location || "TBD",
				capacity: Number(formData.capacity) || 1,
			};

			const savedId = await resolveEventId(payload);
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

			const isNewEvent = !editId && !existingEvent && !createdEventIdRef.current;
			if (isNewEvent) {
				const eligRes = await fetch(`${BASE_URL}/events/can-publish`, {
					headers: authHeaders(),
					credentials: "include",
				});
				if (eligRes.ok) {
					const { allowed } = await eligRes.json();
					if (!allowed) {
						toast.error("You've reached your plan's event limit. Upgrade to publish more.");
						return;
					}
				}
			}

			const eventId = await resolveEventId(payload);
			await uploadImages(eventId);

			const pubRes = await fetch(`${BASE_URL}/events/${eventId}/publish`, {
				method: "POST",
				headers: authHeaders(),
				credentials: "include",
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
				toast.success(
					"Your event has been submitted for admin review. You'll be notified once it's approved.",
					{ duration: 7000 },
				);
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
