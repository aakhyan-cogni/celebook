import { getAvatarUrl } from "../../lib/api";

interface PublicOrganizer {
	id?: string;
	name?: string;
	avatar?: string;
	orgName?: string | null;
	designation?: string | null;
	companyWebsite?: string | null;
	bio?: string | null;
}

interface Props {
	organizer: PublicOrganizer;
}

export default function OrganizerCard({ organizer }: Props) {
	if (!organizer?.name) return null;

	const subtitle = [organizer.designation, organizer.orgName].filter(Boolean).join(" · ");

	return (
		<div className="card border-0 bg-body-tertiary rounded-4 p-3 mt-3 shadow-sm">
			<div className="d-flex align-items-center gap-3">
				<img
					src={getAvatarUrl(organizer.avatar)}
					alt={organizer.name}
					className="rounded-circle flex-shrink-0"
					style={{ width: 48, height: 48, objectFit: "cover" }}
				/>
				<div className="flex-grow-1" style={{ minWidth: 0 }}>
					<div className="text-body-secondary small text-uppercase fw-semibold" style={{ letterSpacing: "0.05em", fontSize: "0.65rem" }}>
						Organized by
					</div>
					<div className="fw-bold text-body" style={{ overflowWrap: "anywhere" }}>{organizer.name}</div>
					{subtitle && (
						<div className="small text-body-secondary" style={{ overflowWrap: "anywhere" }}>{subtitle}</div>
					)}
				</div>
			</div>

			{organizer.bio && (
				<p className="small text-body-secondary mb-0 mt-3 lh-base" style={{ whiteSpace: "pre-wrap" }}>
					{organizer.bio}
				</p>
			)}

			{organizer.companyWebsite && (
				<a
					href={organizer.companyWebsite}
					target="_blank"
					rel="noreferrer"
					className="small text-decoration-none mt-2 d-inline-flex align-items-center gap-1"
				>
					🌐 Visit website
				</a>
			)}
		</div>
	);
}
