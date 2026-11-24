import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';
import { Button } from '../common/Button';

interface QRCodeDisplayProps {
  treeCode: string;
  treeId: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ treeCode, treeId, size = 192 }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qrValue = `https://greenverse.app/passport/${treeCode}`;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrValue, {
      width: size,
      margin: 2,
      color: { dark: '#1a3d2b', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setError('QR generation failed.'); });

    return () => { cancelled = true; };
  }, [qrValue, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `greenverse-passport-${treeCode}.png`;
    a.click();
  };

  if (error) {
    return (
      <div className="text-xs text-rose-600 p-4 bg-rose-50 rounded-lg border border-rose-200">
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center bg-sage-50 rounded-xl border border-sage-200 animate-pulse"
        style={{ width: size, height: size }}
      >
        <QrCode className="w-10 h-10 text-sage-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white border-2 border-forest-600 rounded-2xl shadow-soft inline-block">
        <img src={dataUrl} alt={`QR Code for ${treeCode}`} width={size} height={size} />
      </div>
      <div className="text-center">
        <div className="font-mono text-sm font-bold text-slate-900">{treeCode}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">greenverse.app/passport/{treeCode}</div>
      </div>
      <Button
        variant="outline"
        size="sm"
        icon={<Download className="w-3.5 h-3.5" />}
        onClick={handleDownload}
        className="text-xs"
      >
        Download QR Image
      </Button>
    </div>
  );
};
