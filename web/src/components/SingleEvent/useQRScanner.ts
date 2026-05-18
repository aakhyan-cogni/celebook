import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { checkInAttendee } from "../../lib/api";
import type { CheckInResult } from "../../lib/api";

export function useQRScanner(opts: {
	showScanner: boolean;
	eventId: string;
	onClose: () => void;
}) {
	const { showScanner, eventId, onClose } = opts;
	const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
	const [scanLoading, setScanLoading] = useState(false);
	const [lastScannedToken, setLastScannedToken] = useState<string | null>(null);
	const scannerRef = useRef<any>(null);

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
						if (scanLoading) return;
						setScanLoading(true);
						try {
							await scanner.stop();
							scannerRef.current = null;
							onClose();
							const result = await checkInAttendee(eventId, decodedText, false);
							setLastScannedToken(decodedText);
							setScanResult(result);
						} catch (err: any) {
							scannerRef.current = null;
							toast.error(err.message || "Invalid QR code");
							onClose();
						} finally {
							setScanLoading(false);
						}
					},
					() => {},
				)
				.catch(() => {
					toast.error("Could not access camera. Please allow camera permissions.");
					onClose();
				});
		});

		return () => {
			if (scannerRef.current) {
				scannerRef.current.stop().catch(() => {});
				scannerRef.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showScanner]);

	const clearScan = () => {
		setScanResult(null);
		setLastScannedToken(null);
	};

	return { scanResult, scanLoading, lastScannedToken, clearScan };
}
