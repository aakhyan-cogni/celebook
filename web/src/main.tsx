import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import GlobalEventPage from "./pages/Global_Event";
import EventDetailPage from "./pages/Event";
import Navbar from "./components/Navbar";
import "bootstrap";
import Footer from "./components/Footer";
import Antigravity from "./components/special/Antigravity";
import EventCreationForm from "./components/EventCreationForm";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard.tsx";
import Pricing from "./pages/Pricing.tsx";
import SupportPage from "./pages/SupportPage.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import { Hydrate } from "./components/Hydrate.tsx";
import ConsentModal from "./components/ConsentModal.tsx";
import NotificationSocketProvider from "./components/NotificationSocketProvider.tsx";
import Terms from "./pages/Terms.tsx";
import Admin from "./pages/Admin.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import FeedbackPage from "./pages/Feedback.tsx";
import BookingHistoryPage from "./pages/BookingHistoryPage.tsx";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute.tsx";

createRoot(document.getElementById("root")!).render(<Root />);

function Root() {
	return (
		<BrowserRouter>
			<main className="min-vh-100 min-vw-auto d-flex flex-column justify-content-between">
				<Antigravity
					count={200}
					magnetRadius={6}
					ringRadius={10}
					waveSpeed={0.4}
					waveAmplitude={1}
					particleSize={1.5}
					lerpSpeed={0.05}
					color="#9219fd"
					autoAnimate
					particleVariance={1}
					rotationSpeed={0}
					depthFactor={1}
					pulseSpeed={3}
					particleShape="capsule"
					fieldStrength={10}
				/>
				<Hydrate />
				<NotificationSocketProvider />
				<ConsentModal />
				<Navbar />
				<div className="pt-2 flex-grow-1">
					<Routes>
						<Route path="/" element={<App />} />
						<Route path="/login" element={<Login />} />
						<Route path="/events" element={<GlobalEventPage />} />
						<Route path="/events/:id" element={<EventDetailPage />} />
						<Route path="/pricing" element={<Pricing />} />
						<Route path="/support" element={<SupportPage />} />
						<Route path="/terms" element={<Terms />} />

						<Route element={<ProtectedRoute />}>
							<Route path="/events/:id/feedback" element={<FeedbackPage />} />
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/dashboard/bookings" element={<BookingHistoryPage />} />
							<Route path="/history/myBookings" element={<BookingHistoryPage />} />
							<Route path="/create" element={<EventCreationForm />} />
							<Route path="/notifications" element={<NotificationPage />} />
							<Route path="/user/profile/:id" element={<UserProfilePage />} />
						</Route>

						<Route element={<AdminRoute />}>
							<Route path="/admin" element={<Admin />} />
						</Route>
					</Routes>
				</div>
				<Footer />
				<Toaster position="bottom-center" />
			</main>
		</BrowserRouter>
	);
}
