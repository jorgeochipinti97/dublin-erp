import { Scanner } from "@yudiel/react-qr-scanner";

export const QrScanner = ({ onScan }) => {

  return (
    <div>
      <Scanner
      
      onScan={(result) => onScan(result[0].rawValue)} />
    </div>
  );
};


