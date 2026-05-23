import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { checkInAttendee } from "../../api/registration.api";
import type { CheckInResult } from "../../api/registration.api";

export function useQRScanner(opts: { showScanner: boolean; eventId: string; onClose: () => void }) {
	const { showScanner, eventId, onClose } = opts;
	const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
	const [scanLoading, setScanLoading] = useState(false);
	const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
	const scannerRef = useRef<any>(null);

	// Refs so the long-lived scanner callback always sees current values without
	// the effect re-firing (which would tear down and restart the camera).
	const scanLoadingRef = useRef(false);
	const eventIdRef = useRef(eventId);
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		eventIdRef.current = eventId;
	}, [eventId]);
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!showScanner) return;

		let scanner: any;

		import("html5-qrcode").then(({ Html5Qrcode }) => {
			scanner = new Html5Qrcode("qr-reader-se");
			scannerRef.current = scanner;

			scanner
				.start(
					{ facingMode: "environment" },
					{ fps: 15, qrbox: { width: 280, height: 280 } },
					async (decodedText: string) => {
						if (scanLoadingRef.current) return;
						scanLoadingRef.current = true;
						setScanLoading(true);
						try {
							await scanner.stop();
							scannerRef.current = null;
							onCloseRef.current();
							const result = await checkInAttendee(eventIdRef.current, decodedText, false);
							setLastScannedToken(decodedText);
							setScanResult(result);
						} catch (err: any) {
							scannerRef.current = null;
							toast.error(err.message || "Invalid QR code");
							onCloseRef.current();
						} finally {
							scanLoadingRef.current = false;
							setScanLoading(false);
						}
					},
					() => {},
				)
				.catch(() => {
					toast.error("Could not access camera. Please allow camera permissions.");
					onCloseRef.current();
				});
		});

		return () => {
			if (scannerRef.current) {
				scannerRef.current.stop().catch(() => {});
				scannerRef.current = null;
			}
		};
	}, [showScanner]);

	const clearScan = () => {
		setScanResult(null);
		setLastScannedToken(null);
	};

	return { scanResult, scanLoading, lastScannedToken, clearScan };
}
