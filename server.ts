import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Supabase Client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dfbduedbvessfzpdiwyw.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmYmR1ZWRidmVzc2Z6cGRpd3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDAyMzgsImV4cCI6MjA4MTcxNjIzOH0.eYtCAeXs9BnFNmdSSz4SziN9FTJxGHysl73luuuaAIQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: '10mb' }));

// 1. VTU Payments API (Airtime & Data)
app.post('/api/payments/vtu', async (req, res) => {
  const { userId, amount, phone, network, type } = req.body;
  if (!userId || !amount || !phone) {
    return res.status(400).json({ success: false, message: "Missing required billing details" });
  }

  try {
    // 1. Fetch current profile
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (pError || !profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance for VTU purchase" });
    }

    const ref = `VTU-${Math.floor(100000 + Math.random() * 899900)}`;

    // 2. Perform direct debit transaction
    const { error: txError } = await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'out',
      category: type === 'data' ? 'Data' : 'Airtime',
      title: `${network} ${type === 'data' ? 'Data' : 'Airtime'} Purchase`,
      description: `Recharge for ${phone}`,
      amount: parseFloat(amount),
      status: 'SUCCESS',
      reference: ref
    }]);

    if (txError) throw txError;

    // 3. Deduct balance from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amount } as any)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Recharge successful!", reference: ref });
  } catch (error: any) {
    console.error("VTU API Error:", error);
    res.status(500).json({ success: false, message: error.message || "VTU Gateway payment error" });
  }
});

// 2. Bills API (Electricity & Cable TV)
app.post('/api/payments/bills', async (req, res) => {
  const { userId, amount, biller, meterNo, smartCard, category } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: "Missing bill payment details" });
  }

  try {
    // 1. Fetch profile
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (pError || !profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance for bill payment" });
    }

    const ref = `BIL-${Math.floor(100000 + Math.random() * 899900)}`;
    const identifier = meterNo || smartCard || "N/A";

    // 2. Insert transaction
    const { error: txError } = await supabase.from('transactions').insert([{
      user_id: userId,
      type: 'out',
      category: category || 'Bills',
      title: `${biller || 'Utility Bill'} Payment`,
      description: `Account ID/Meter: ${identifier}`,
      amount: parseFloat(amount),
      status: 'SUCCESS',
      reference: ref
    }]);

    if (txError) throw txError;

    // 3. Deduct balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amount } as any)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Bill payment processed successfully", reference: ref });
  } catch (error: any) {
    console.error("Bills API Error:", error);
    res.status(500).json({ success: false, message: error.message || "Bills routing transaction error" });
  }
});

// 3. Peer-to-Peer Transfer API
app.post('/api/paytitan/transfer', async (req, res) => {
  const { senderId, receiverUsername, amount, note } = req.body;
  if (!senderId || !receiverUsername || !amount) {
    return res.status(400).json({ success: false, message: "Missing P2P transfer details" });
  }

  try {
    // 1. Find Sender
    const { data: sender, error: sError } = await supabase
      .from('profiles')
      .select('balance, username')
      .eq('id', senderId)
      .single();

    if (sError || !sender) {
      return res.status(404).json({ success: false, message: "Sender not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // 2. Find Receiver
    const cleanUsername = receiverUsername.replace('@', '').trim().toLowerCase();
    const { data: receiver, error: rError } = await supabase
      .from('profiles')
      .select('id, balance, username')
      .eq('username', cleanUsername)
      .single();

    if (rError || !receiver) {
      return res.status(404).json({ success: false, message: "Recipient user not found on PayTitan network" });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ success: false, message: "You cannot transfer money to yourself" });
    }

    const ref = `TX-${Math.floor(100000 + Math.random() * 899900)}`;

    // 3. Debit Sender
    await supabase.from('transactions').insert([{
      user_id: senderId,
      type: 'out',
      category: 'Transfer',
      title: `Transfer to @${receiver.username}`,
      description: note || 'Instant P2P Transfer',
      amount: parseFloat(amount),
      status: 'SUCCESS',
      reference: ref
    }]);

    await supabase
      .from('profiles')
      .update({ balance: sender.balance - amount } as any)
      .eq('id', senderId);

    // 4. Credit Receiver
    await supabase.from('transactions').insert([{
      user_id: receiver.id,
      type: 'in',
      category: 'Transfer',
      title: `Received from @${sender.username}`,
      description: note || 'Instant P2P Transfer',
      amount: parseFloat(amount),
      status: 'SUCCESS',
      reference: ref
    }]);

    await supabase
      .from('profiles')
      .update({ balance: receiver.balance + amount } as any)
      .eq('id', receiver.id);

    res.json({ success: true, message: "Transfer completed successfully", reference: ref });
  } catch (error: any) {
    console.error("P2P Transfer API Error:", error);
    res.status(500).json({ success: false, message: error.message || "P2P transaction ledger error" });
  }
});

// 4. Gemini AI Assistance / Chat Routing
app.post('/api/gemini', async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are TitanAI, a professional elite personal finance and banking assistant for PayTitan users.",
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Gemini processing exception" });
  }
});

// 5. OCR Scanner API (Camera scanning of written account numbers)
app.post('/api/ocr', async (req, res) => {
  const { image } = req.body; // base64 encoded jpeg frame
  if (!image) {
    return res.status(400).json({ success: false, message: "No image frame received" });
  }

  try {
    // Strip the data:image/... base64 header if present
    const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          }
        },
        {
          text: `Analyze this image containing written or typed bank details. Identify any 10-digit number sequence representing a bank account number. Also, identify any prominent Nigerian bank name written (such as OPay, PalmPay, GTBank, Kuda, Zenith, Access, UBA, Wema, Sterling, Moniepoint, FCMB, First Bank).
Return your response strictly as a JSON object, with no formatting or markdown other than valid JSON. Output must precisely follow this structure:
{
  "success": true,
  "accountNumber": "10-digit account string found, otherwise empty",
  "bankName": "Identified bank name matching one of our standard bank labels, or empty if unknown"
}
If no 10-digit sequence is found, return success: false.`
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("OCR API Error:", error);
    res.status(500).json({ success: false, message: error.message || "Gemini OCR processing exception" });
  }
});

// Implement Vite middleware for Hot Module Replacement in Development
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server booting successfully on port ${PORT}`);
  });
};

startServer();
