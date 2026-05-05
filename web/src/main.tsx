import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./style.scss";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/login";
import GlobalEventPage from "./pages/Global_Event";
import Navbar from "./components/Navbar";
import "bootstrap";
import Footer from "./components/Footer";
import Antigravity from "./components/special/Antigravity";
import EventCreationForm from "./components/EventCreationForm.tsx";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard.tsx";
import Pricing from "./pages/Pricing.tsx";
import SupportPage from "./pages/SupportPage.tsx";
import NotificationPage from "./pages/NotificationPage.tsx";
import { Hydrate } from "./components/Hydrate.tsx";
import ConsentModal from "./components/ConsentModal.tsx";
import Terms from "./pages/Terms.tsx";

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
				<ConsentModal />
				<Navbar />
				<Routes>
					<Route path="/" element={<App />} />
					<Route path="/login" element={<Login />} />
					<Route path="/events" element={<GlobalEventPage />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/create" element={<EventCreationForm />} />
					<Route path="/pricing" element={<Pricing />} />
					<Route path="/support" element={<SupportPage />} />
					<Route path="/notifications" element={<NotificationPage />} />
					<Route path="/terms" element={<Terms />} />
				</Routes>
				<Footer />
				<Toaster position="bottom-center" />
			</main>
		</BrowserRouter>
	);
}
