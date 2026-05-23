import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Location } from "react-router";
import { BASE_URL } from "../../lib/api";
import { INITIAL_FORM_DATA, TOTAL_STEPS, type EventFormData } from "./constants";

export function useEventFormData(opts: {
	editId: string | null;
	autoPublish: boolean;
	location: Location;
	accessToken: string | null | undefined;
}) {
	const { editId, autoPublish, location, accessToken } = opts;
	const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
	const [isFree, setIsFree] = useState(true);
	const [existingEvent, setExistingEvent] = useState<any>(null);
	const [existingUrls, setExistingUrls] = useState<string[]>([]);
	const [step, setStep] = useState(1);

	const splitLocalDateTime = (iso: string | Date | null | undefined): { date: string; time: string } => {
		if (!iso) return { date: "", time: "" };
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return { date: "", time: "" };
		const pad = (n: number) => String(n).padStart(2, "0");
		return {
			date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
			time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
		};
	};

	const fillForm = (ev: any) => {
		setExistingEvent(ev);
		const start = splitLocalDateTime(ev.date);
		const end = splitLocalDateTime(ev.endDate);
		setFormData({
			title: ev.title ?? "",
			category: ev.category ?? "Workshop",
			description: ev.description ?? "",
			date: start.date,
			time: start.time,
			endDate: end.date,
			endTime: end.time,
			location: ev.location ?? "",
			price: ev.price ?? 0,
			capacity: ev.capacity ?? 0,
			currency: ev.currency ?? "INR",
			visibility: ev.visibility ?? "PUBLIC",
		});
		setIsFree(ev.price === 0);
		if (ev.imgUrls?.length) setExistingUrls(ev.imgUrls);
	};

	useEffect(() => {
		if (!editId) return;
		const stateEvent = (location.state as any)?.eventData;
		if (stateEvent) {
			fillForm(stateEvent);
		}
	}, [editId]);

	useEffect(() => {
		if (!editId) return;
		if (existingEvent) return;
		if ((location.state as any)?.eventData) return;

		const load = async () => {
			try {
				const headers: HeadersInit = { "Content-Type": "application/json" };
				if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
				const res = await fetch(`${BASE_URL}/events/${editId}`, {
					method: "GET",
					headers,
					credentials: "include",
				});
				if (!res.ok) {
					toast.error("Could not load event for editing.");
					return;
				}
				const ev = await res.json();
				fillForm(ev);
			} catch {
				toast.error("Could not load event for editing.");
			}
		};
		load();
	}, [editId, accessToken]);

	useEffect(() => {
		if (autoPublish && existingEvent) {
			setStep(TOTAL_STEPS);
		}
	}, [autoPublish, existingEvent]);

	return {
		formData,
		setFormData,
		isFree,
		setIsFree,
		existingEvent,
		existingUrls,
		setExistingUrls,
		step,
		setStep,
	};
}
