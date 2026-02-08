import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
}

export default function QRModal({ open, onClose, url }: QRModalProps) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  if (!open) return null;

  const handleDownload = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current;
    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qr-code.png";
    link.click();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "QR Code",
          text: "Scan this QR",
          url,
        });
      } 
      else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 text-center relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl">
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4">Scan QR</h3>

        <div className="flex justify-center mb-4">
          <QRCodeCanvas
            value={url}
            size={200}
            ref={qrRef}
          />
        </div>

        <p className="text-xs text-gray-500 break-all mb-4">{url}</p>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:opacity-90"
          >
            Download
          </button>

          <button
            onClick={handleShare}
            className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
