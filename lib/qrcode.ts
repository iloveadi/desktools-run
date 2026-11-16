import QRCode from "qrcode";

export type QRErrorCorrectionLevel = "L" | "M" | "Q" | "H";

/**
 * Standard-compliant QR Code generator powered by npm `qrcode` (ISO/IEC 18004).
 * Supports standard text, URLs, and Wi-Fi networks with automatic version detection,
 * complete BCH (15, 5) Format Information, and Reed-Solomon Error Correction.
 */
export function generateQRCodeMatrix(
  text: string,
  errorCorrectionLevel: QRErrorCorrectionLevel = "M"
): boolean[][] {
  const content = text && text.trim().length > 0 ? text : "https://desktools.run";

  try {
    const qr = QRCode.create(content, {
      errorCorrectionLevel,
    });

    const size = qr.modules.size;
    const matrix: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(qr.modules.get(r, c) === 1);
      }
      matrix.push(row);
    }

    return matrix;
  } catch (error) {
    console.error("[generateQRCodeMatrix] Failed to encode QR:", error);
    // Fallback safe default QR code
    const fallback = QRCode.create("https://desktools.run", { errorCorrectionLevel: "M" });
    const size = fallback.modules.size;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(fallback.modules.get(r, c) === 1);
      }
      matrix.push(row);
    }
    return matrix;
  }
}
