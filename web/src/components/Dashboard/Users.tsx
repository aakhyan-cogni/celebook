import { useEffect, useState } from "react";
import { type User } from "../../store";
import { motion } from "motion/react";
import { apiFetch } from "../../lib/api";

const Users = () => {
	const [baseUsers, setBaseUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");

	const profileImg = `http://localhost:5000/uploads/avatars/`;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const usersRes = await apiFetch(
					"/admin/users",
					{ method: "GET" },
					{ page: page.toString(), limit: "5" },
				);
				const fetchedUsers = usersRes.users ?? usersRes;

				setBaseUsers(fetchedUsers);

				if (fetchedUsers.length <= 0 && page > 1) {
					setPage((prev) => prev - 1);
				}
			} catch (err) {
				console.error("Failed to fetch overview data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [page]);

	const displayedUsers =
		search === ""
			? baseUsers
			: baseUsers.filter((u) =>
					(u.email.toString() + u.name.toString() + u.role?.toString())
						.toLowerCase()
						.includes(search.toLowerCase()),
				);

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center p-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (page <= 0) setPage(1);

	return (
		<div className="container">
			{/* User Stats */}
			<section>
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold mb-0">User Stats</h3>
					<div className="d-flex justify-content-around gap-3 align-items-center mb-4">
						<input
							className="form-control w-auto"
							type="search"
							placeholder="Search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								setPage((prev) => prev - 1);
							}}
							className={`btn ${page > 1 ? "btn-info" : "btn-secondary"} border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1`}
						>
							<span>{"← " + (page - 1)}</span>
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							disabled={true}
							className={`btn btn-info border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1`}
						>
							<span>{page}</span>
						</motion.button>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => {
								setPage((prev) => prev + 1);
							}}
							className="btn btn-secondary border border-1 px-3 py-1 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-1"
						>
							<span>{"→ " + (page + 1)}</span>
						</motion.button>
					</div>
				</div>

				{/* 5. Map over 'displayedUsers' instead of the raw state */}
				{displayedUsers.length > 0 ? (
					<div className="row g-4">
						{displayedUsers.map((user) => (
							<div key={user.id} className="col-md-6 col-lg-4">
								<div className="card shadow-sm rounded-4 p-3">
									<div className="d-flex align-items-center gap-3">
										<img
											src={profileImg + user.avatar}
											alt={user.name}
											className="rounded-circle"
											width={48}
											height={48}
											style={{ objectFit: "cover" }}
										/>
										<div>
											<p className="fw-bold mb-0">{user.name}</p>
											<p className="text-muted small mb-0">{user.email}</p>
											<span className="badge bg-secondary mt-1">{user.role}</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center p-5 rounded-4 border border-dashed">
						<p className="text-muted mb-0">No users found.</p>
					</div>
				)}
			</section>
		</div>
	);
};

export default Users;
