import { getImageUrl } from "../../lib/api";

interface Organizer {
	id?: string;
	name?: string;
	email?: string;
	avatar?: string;
	phoneNumber?: string | null;
	gender?: string | null;
	orgName?: string | null;
	designation?: string | null;
	companyWebsite?: string | null;
	bio?: string | null;
	country?: string | null;
	city?: string | null;
	state?: string | null;
	role?: string;
	tier?: string;
	createdAt?: string;
}

interface Props {
	organizer: Organizer;
	eventStatus: string;
}

const TIER_BADGE: Record<string, string> = {
	FREE: "text-bg-secondary",
	PRO: "text-bg-info",
	ULTIMATE: "text-bg-warning",
};

const Row = ({ icon, label, value }: { icon: string; label: string; value?: React.ReactNode }) => {
	if (value === undefined || value === null || value === "") return null;
	return (
		<div className="d-flex align-items-start gap-2 small mb-2">
			<span className="text-primary" style={{ width: 18 }}>{icon}</span>
			<span className="text-body-secondary" style={{ minWidth: 90 }}>{label}</span>
			<span className="fw-semibold text-body text-break">{value}</span>
		</div>
	);
};

export default function OrganizerDetailsPanel({ organizer, eventStatus }: Props) {
	const avatarSrc = organizer.avatar
		? getImageUrl(`/uploads/avatars/${organizer.avatar}`)
		: getImageUrl("/uploads/avatars/default.png");

	const location = [organizer.city, organizer.state, organizer.country].filter(Boolean).join(", ");
	const joined = organizer.createdAt
		? new Date(organizer.createdAt).toLocaleDateString([], { dateStyle: "medium" })
		: undefined;

	return (
		<div className="card border-0 bg-body-tertiary rounded-4 overflow-hidden mt-4">
			<div
				className="px-4 py-3 d-flex align-items-center justify-content-between"
				style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" }}
			>
				<div>
					<div className="text-white fw-bold small text-uppercase" style={{ letterSpacing: "0.07em" }}>
						Organizer Details
					</div>
					<div className="text-white opacity-75" style={{ fontSize: "0.72rem" }}>
						Verify before {eventStatus === "PENDING" ? "approving" : "any action"}
					</div>
				</div>
				{organizer.tier && (
					<span
						className={`badge rounded-pill px-3 py-2 ${TIER_BADGE[organizer.tier] ?? "text-bg-secondary"}`}
						style={{ fontSize: "0.72rem" }}
					>
						{organizer.tier}
					</span>
				)}
			</div>

			<div className="p-3 p-md-4">
				<div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
					<img
						src={avatarSrc}
						alt={organizer.name ?? "organizer"}
						className="rounded-circle shadow-sm"
						style={{ width: 64, height: 64, objectFit: "cover" }}
					/>
					<div className="flex-grow-1">
						<div className="fw-bold fs-6 text-body">{organizer.name ?? "—"}</div>
						{organizer.designation && (
							<div className="small text-body-secondary">{organizer.designation}</div>
						)}
						{organizer.role && (
							<span className="badge bg-primary-subtle text-primary rounded-pill px-2 mt-1" style={{ fontSize: "0.65rem" }}>
								{organizer.role}
							</span>
						)}
					</div>
				</div>

				<div>
					<Row icon="✉️" label="Email" value={organizer.email} />
					<Row icon="📞" label="Phone" value={organizer.phoneNumber ?? undefined} />
					<Row icon="⚧" label="Gender" value={organizer.gender ?? undefined} />
					<Row icon="📍" label="Location" value={location || undefined} />
					<Row icon="🏢" label="Organization" value={organizer.orgName ?? undefined} />
					<Row
						icon="🌐"
						label="Website"
						value={
							organizer.companyWebsite ? (
								<a
									href={organizer.companyWebsite}
									target="_blank"
									rel="noreferrer"
									className="text-decoration-none"
								>
									{organizer.companyWebsite}
								</a>
							) : undefined
						}
					/>
					<Row icon="📅" label="Joined" value={joined} />
				</div>

				{organizer.bio && (
					<div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
						<div className="small text-body-secondary fw-semibold mb-1">Bio</div>
						<p className="small text-body mb-0 lh-base">{organizer.bio}</p>
					</div>
				)}
			</div>
		</div>
	);
}
