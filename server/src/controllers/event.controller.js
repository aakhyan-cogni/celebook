import * as EventService from "../services/event.service.js";

export const getEvents = async (req, res) => {
	try {
		const events = await EventService.getAllEvents();
		res.status(200).json(events);
	} catch (error) {
		res.status(500).json({ message: "Error fetching events" });
	}
};
