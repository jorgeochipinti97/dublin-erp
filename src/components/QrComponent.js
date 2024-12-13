"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export const QrComponent = ({ setMessage }) => {
  const qrScannerRef = useRef(null);

  useEffect(() => {
    const qrCodeRegionId = "reader";

    if (qrScannerRef.current) {
      const html5QrCodeScanner = new Html5QrcodeScanner(qrCodeRegionId, {
        fps: 10,
        qrbox: { width: 150, height: 150 },
        aspectRatio: 1.0,
        disableFlip: false, // Mantiene la imagen no invertida si es necesario
      });

      html5QrCodeScanner.render(
        (qrCodeMessage) => {
          console.log("QR Code detected:", qrCodeMessage);
          setMessage(qrCodeMessage);
        },
        (errorMessage) => {
          console.error("QR Code not detected:", errorMessage);
        }
      );

      // Limpia el scanner al desmontar el componente
      return () => {
        html5QrCodeScanner.clear();
      };
    }
  }, []);

  return (
    <div className="md:hidden w-6/12">
      <div id="reader" className="rounded-xl p-2" ref={qrScannerRef}></div>
    </div>
  );
};
