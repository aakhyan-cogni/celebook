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

	const fillForm = (ev: any) => {
		setExistingEvent(ev);
		const existingTime = ev.date ? new Date(ev.date).toTimeString().slice(0, 5) : "";
		setFormData({
			title: ev.title ?? "",
			category: ev.category ?? "Workshop",
			description: ev.description ?? "",
			date: ev.date ? ev.date.slice(0, 10) : "",
			time: existingTime,
			location: ev.location ?? "",
			price: ev.price ?? 0,
			capacity: ev.capacity ?? 0,
			currency: ev.currency ?? "INR",
			visibility: ev.visibility ?? "PUBLIC",
			isTeamEvent: ev.isTeamEvent ?? false,
			minTeamSize: ev.minTeamSize ?? "",
			maxTeamSize: ev.maxTeamSize ?? "",
			teamCapacityMode: ev.teamCapacityMode ?? "PER_MEMBER",
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
