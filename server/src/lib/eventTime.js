

export function computeEventTimeState(event, now = Date.now()) {
	if (!event) return "UPCOMING";
	if (event.endedAt) return "FINISHED";

	const start = event.date ? new Date(event.date).getTime() : null;
	if (start === null) return "UPCOMING";
	if (now < start) return "UPCOMING";

	const end = event.endDate ? new Date(event.endDate).getTime() : start;
	if (now < end) return "ONGOING";
	return "FINISHED";
}

export const isUpcoming = (event, now) => computeEventTimeState(event, now) === "UPCOMING";
export const isOngoing = (event, now) => computeEventTimeState(event, now) === "ONGOING";
export const isFinished = (event, now) => computeEventTimeState(event, now) === "FINISHED";

export function eventSortPipeline(now = new Date()) {
	return [
		{
			$addFields: {
				_bucket: {
					$switch: {
						branches: [
							{ case: { $ne: ["$endedAt", null] }, then: 2 },
							{ case: { $gt: ["$date", now] }, then: 1 },
							{
								case: {
									$and: [
										{ $lte: ["$date", now] },
										{ $ne: ["$endDate", null] },
										{ $gt: ["$endDate", now] },
									],
								},
								then: 0,
							},
						],
						default: 2,
					},
				},
			},
		},
		{
			$addFields: {
				_secondary: {
					$cond: [
						{ $eq: ["$_bucket", 2] },
						{ $multiply: [{ $toLong: "$date" }, -1] },
						{ $toLong: "$date" },
					],
				},
			},
		},
		{ $sort: { _bucket: 1, _secondary: 1 } },
		{ $unset: ["_bucket", "_secondary"] },
	];
}
