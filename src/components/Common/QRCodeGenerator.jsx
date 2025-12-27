import { useRef } from 'react';
import QRCode from "react-qr-code";

function QRCodeGenerator({ url }) {
    const qrCodeRef = useRef(null);

    const handleDownload = () => {
        const svg = qrCodeRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const padding = 40; // Increase padding for better visibility
            const scale = 4; // Increase scale for higher resolution
            const qrCodeSize = 256 * scale; // Scale the QR code size

            canvas.width = qrCodeSize + padding * 2;
            canvas.height = qrCodeSize + padding * 2;

            // Draw background with padding
            ctx.fillStyle = "white"; // Background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the QR code image
            ctx.drawImage(img, padding, padding, qrCodeSize, qrCodeSize);

            // Convert canvas to PNG and trigger download
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngFile;
            downloadLink.download = 'qrcode.png';
            downloadLink.click();
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    

    return (
        <div className="qrcode-generator mt-1">
           
            <div className="qrcode-container m-2" ref={qrCodeRef}>
                <div
                    style={{
                        height: "auto",
                        margin: "0 auto",
                        maxWidth: 200,
                        width: "100%",
                        padding: "20px", // Add padding here
                        backgroundColor: "white", // Optional: Add a background color for better visibility
                        borderRadius: "10px", // Optional: Add rounded corners
                    }}
                >
                    <QRCode
                        fill="red"
                        size={256}
                        style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                        }}
                        value={url}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </div>
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md hover:shadow-lg transition duration-300 m-auto mt-4 block"
                onClick={handleDownload}
            >
                Download QR Code
            </button>
            
        </div>
    );
}

export default QRCodeGenerator;