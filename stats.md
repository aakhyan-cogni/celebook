[event] -> 1 registration -> 1 user

on every registeration
// check that event id in event stats collection
// if it exists then append the user id in that document
// if it doesnt exist then we create one eventStat document with that user id

1 event <-> 1 eventStat doc
model eventStats {
eventId: string
attendees: string[]
avgFeedback?: number
}

event full page:
-> event details from event object (already done)
-> next shows up event stats: only if that event's organizer id matches logged in user id
(maybe show to admins?)

-> conditional buttons for approval and rejection of event (admin only) (already done)

-> conditional buttons if user has booked the event, should allow a button cancel.

-> conditional button for organizer if the eventSTats does not exist, they can cancel the event. (it shows up as cancelled, does not get deleted from database)
