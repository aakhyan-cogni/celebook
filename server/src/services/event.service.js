export const getAllEvents = async () => {
	const categories = ["Conference", "Workshop", "Social", "Entertainment", "Health & Wellness", "Education", "Other"];

	const locations = [
		"New York, NY",
		"London, UK",
		"Remote",
		"Tokyo, Japan",
		"Berlin, Germany",
		"Austin, TX",
		"Paris, France",
	];
	const currencies = ["USD", "EUR", "GBP", "JPY", "INR"];

	const baseEvents = [
		{ title: "Next.js Conf 2026", category: "Conference", tags: "Nextjs, React, Vercel" },
		{ title: "Deep Sea Photography", category: "Workshop", tags: "Art, Camera, Ocean" },
		{ title: "Summer Rooftop Mixer", category: "Social", tags: "Networking, Drinks" },
		{ title: "Indie Rock Night", category: "Entertainment", tags: "Live Music, Rock" },
		{ title: "Mindfulness Meditation", category: "Health & Wellness", tags: "Mental Health, Zen" },
		{ title: "Blockchain Fundamentals", category: "Education", tags: "Crypto, Web3" },
		{ title: "Retro Gaming Expo", category: "Other", tags: "Gaming, Nostalgia" },
		{ title: "AI Strategy for CEOs", category: "Conference", tags: "AI, Business" },
		{ title: "Pottery for Beginners", category: "Workshop", tags: "Hobby, Craft" },
		{ title: "Speed Dating Night", category: "Social", tags: "Social, Fun" },
		{ title: "Stand-up Comedy Special", category: "Entertainment", tags: "Comedy, Nightlife" },
		{ title: "Marathon Training Club", category: "Health & Wellness", tags: "Running, Fitness" },
		{ title: "Intro to Python", category: "Education", tags: "Coding, Data Science" },
		{ title: "Urban Gardening Meetup", category: "Other", tags: "Green, Community" },
		{ title: "Cybersecurity Summit", category: "Conference", tags: "Security, Tech" },
		{ title: "Bread Baking Masterclass", category: "Workshop", tags: "Food, Cooking" },
		{ title: "High School Reunion 2016", category: "Social", tags: "Social, Alumni" },
		{ title: "Electronic Music Fest", category: "Entertainment", tags: "EDM, Dance" },
		{ title: "Pilates in the Park", category: "Health & Wellness", tags: "Yoga, Fitness" },
		{ title: "Machine Learning 101", category: "Education", tags: "AI, Math" },
		{ title: "Local Farmers Market", category: "Other", tags: "Food, Local" },
		{ title: "UX/UI Design Awards", category: "Conference", tags: "Design, Creative" },
		{ title: "Watercolor Painting", category: "Workshop", tags: "Art, Painting" },
		{ title: "Charity Gala Dinner", category: "Social", tags: "Charity, Formal" },
		{ title: "Outdoor Cinema Night", category: "Entertainment", tags: "Movie, Summer" },
		{ title: "Crossfit Challenge", category: "Health & Wellness", tags: "Gym, Sports" },
		{ title: "History of Rome Series", category: "Education", tags: "History, Lecture" },
		{ title: "Comic Book Convention", category: "Other", tags: "Comics, Pop Culture" },
		{ title: "SaaS Growth Hackathon", category: "Workshop", tags: "Startup, SaaS" },
		{ title: "Wine Tasting Tour", category: "Social", tags: "Wine, Social" },
	];

	return baseEvents.map((event, index) => {
		const id = index + 1;
		const price = Math.floor(Math.random() * 200);
		const attendees = Math.floor(Math.random() * 500) + 10;

		const dateOffset = Math.floor(Math.random() * 22) - 7;
		const eventDateTime = new Date();
		eventDateTime.setDate(eventDateTime.getDate() + dateOffset);
		eventDateTime.setHours(Math.floor(Math.random() * 12) + 9, 0, 0, 0);

		return {
			id,
			title: event.title,
			price: price === 0 ? 0 : price,
			currency: currencies[Math.floor(Math.random() * currencies.length)],
			location: locations[Math.floor(Math.random() * locations.length)],
			category: categories[Math.floor(Math.random() * categories.length)],
			image: `https://picsum.photos/seed/${id + 123}/800/600`,
			description: `This is a short preview description for ${event.title}.`,
			longDescription: `Full details for ${event.title}. This event will cover extensive topics including ${event.tags}. Join us for an unforgettable experience with over ${attendees} expected guests!`,
			venue: price > 100 ? "Grand Plaza Hotel" : "Community Center",
			tags: event.tags,
			attendees,
			eventDateTime,
			avgRating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
			totalRatings: Math.floor(Math.random() * 100),
			reviews: [
				{
					id: `rev-${id}`,
					review: "Had a great time, would definitely recommend to others!",
					author: { id: `u-${id}`, name: "User " + id, email: `user${id}@example.com` },
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
		};
	});
};
