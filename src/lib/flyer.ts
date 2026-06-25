import { Transaction, Profile } from '../context/PayTitanContext';

// Generates a stunning transaction receipt flyer and downloads it directly to the user's device as a PNG image.
export const generateReceiptFlyer = async (transaction: Transaction, profile: Profile | null): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      // Background gradient (Cosmic Slate aesthetic)
      const grad = ctx.createLinearGradient(0, 0, 0, 1000);
      grad.addColorStop(0, '#0F1319');
      grad.addColorStop(1, '#080A0D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 1000);

      // Grid mesh network lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      for (let y = 0; y < 1000; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      // Soft Orange Neon flare background glow
      const glow = ctx.createRadialGradient(400, 300, 50, 400, 300, 400);
      glow.addColorStop(0, 'rgba(255, 77, 28, 0.07)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 800, 1000);

      // Header Brand Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P A Y T I T A N', 400, 100);

      ctx.fillStyle = '#FF4D1C';
      ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
      ctx.fillText('SOCIAL BANKING CORE PROTOCOL FOR ARCHITECTS', 400, 125);

      // Main Glass Card Border & Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      
      const x = 100, y = 170, w = 600, h = 680, r = 24;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Transaction Status Badge Circle
      const isCredit = transaction.type === 'in' || transaction.type === 'receive';
      ctx.fillStyle = isCredit ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
      ctx.strokeStyle = isCredit ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      
      ctx.beginPath();
      ctx.arc(400, 250, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Transmitting directional arrow
      ctx.strokeStyle = isCredit ? '#22C55E' : '#EF4444';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (isCredit) {
        ctx.beginPath();
        ctx.moveTo(400, 230);
        ctx.lineTo(400, 270);
        ctx.moveTo(385, 255);
        ctx.lineTo(400, 270);
        ctx.lineTo(415, 255);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(400, 270);
        ctx.lineTo(400, 230);
        ctx.moveTo(385, 245);
        ctx.lineTo(400, 230);
        ctx.lineTo(415, 245);
        ctx.stroke();
      }

      // Title & Status
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Helvetica, Arial, sans-serif';
      ctx.fillText(transaction.title, 400, 335);

      ctx.fillStyle = isCredit ? '#22C55E' : '#EF4444';
      ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
      ctx.fillText(transaction.status || 'SUCCESSFULLY SETTLED', 400, 360);

      // Amount Display
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px Helvetica, Arial, sans-serif';
      ctx.fillText(`₦${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 400, 445);

      // Separation Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(150, 485);
      ctx.lineTo(650, 485);
      ctx.stroke();

      // Detail Rows
      const details = [
        { label: 'Date Time', val: new Date(transaction.created_at).toLocaleString() },
        { label: 'Service Category', val: (transaction.category || 'Transfer').toUpperCase() },
        { label: 'Reference Code', val: transaction.reference || 'N/A' },
        { label: 'Architect Holder', val: `@${profile?.username || 'titan_user'}` },
        { label: 'Settlement Nodes', val: 'SECURE CLOUD DEBIT LEDGER' }
      ];

      ctx.textAlign = 'left';
      let currY = 535;
      details.forEach((det) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '15px Helvetica, Arial, sans-serif';
        ctx.fillText(det.label, 150, currY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
        ctx.fillText(det.val, 650, currY);

        ctx.textAlign = 'left'; 
        currY += 50;
      });

      // Footer smart seal
      ctx.strokeStyle = 'rgba(255, 77, 28, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(400, 915, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); 

      ctx.fillStyle = '#FF4D1C';
      ctx.font = '10px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NODE SECURED', 400, 912);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillText('LEDGER VERIFIED', 400, 925);

      // Download file directly
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `PayTitan_Receipt_${transaction.reference || transaction.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();

      resolve(true);
    } catch (e) {
      console.error("Flyer creation failure", e);
      resolve(false);
    }
  });
};
