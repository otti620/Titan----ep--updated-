import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/integrations/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, phone, network, type, provider = 'payscribe' } = body;

    if (!userId || !amount || !phone || !network || !type) {
      return NextResponse.json({ success: false, message: "Missing required fields: userId, amount, phone, network, type" }, { status: 400 });
    }

    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid recharge amount" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Get user profile and verify active balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, message: "User profile search empty." }, { status: 404 });
    }

    const currentBalance = parseFloat(profile.balance || '0');
    if (currentBalance < rechargeAmount) {
      return NextResponse.json({ success: false, message: "Insufficient balance to purchase VTU bundle." }, { status: 400 });
    }

    // 2. Safely deduct wallet funds via server RPC
    const { error: fundError } = await supabaseAdmin.rpc('admin_fund_wallet', {
      p_user_id: userId,
      p_amount: -rechargeAmount
    });

    if (fundError) {
      console.error("Secure wallet deduction error:", fundError);
      return NextResponse.json({ success: false, message: "Payment checkout failed to securely debit wallet." }, { status: 500 });
    }

    // 3. Initiate VTU endpoint connection (Payscribe Airtime/Data or Flutterwave)
    let externalRef = `VTU-${Math.floor(100000 + Math.random() * 900000)}`;
    let apiLogs = 'Simulated automated topup delivery (Sandbox Mode)';
    let providerStatus = 'SUCCESS';

    const payscribeKey = process.env.PAYSCRIBE_API_KEY;
    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (provider === 'payscribe' && payscribeKey) {
      try {
        const isAirtime = type === 'airtime';
        const endpoint = isAirtime ? 'https://api.payscribe.ng/v1/airtime' : 'https://api.payscribe.ng/v1/data';
        
        const payload = isAirtime ? {
          phone: phone,
          network: network.toLowerCase(),
          amount: rechargeAmount,
          portrait: false
        } : {
          phone: phone,
          network: network.toLowerCase(),
          plan_id: body.planId || "mtn-100mb" // optional plan code
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${payscribeKey}`
          },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();
        if (resData.status === 'success' || resData.success) {
          externalRef = resData.ref || resData.transaction_id || externalRef;
          apiLogs = `Payscribe live VTU response success.`;
        } else {
          providerStatus = 'FAILED';
          apiLogs = `Payscribe rejected VTU event: ${resData.message || 'unknown rejection'}`;
        }
      } catch (e: any) {
        console.error("Outbound Payscribe Connection failure:", e);
        apiLogs = `Payscribe connecting socket error: ${e.message}`;
      }
    } else if (provider === 'flutterwave' && flutterwaveKey) {
      try {
        const payload = {
          country: "NG",
          customer: phone,
          amount: rechargeAmount,
          recurrence: "ONCE",
          type: type === 'airtime' ? 'AIRTIME' : 'MOBILEDATA',
          reference: externalRef
        };
        const res = await fetch('https://api.flutterwave.com/v3/bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${flutterwaveKey}`
          },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData.status === 'success') {
          externalRef = resData.data?.tx_ref || externalRef;
          apiLogs = 'Flutterwave VTU transaction successful.';
        } else {
          providerStatus = 'FAILED';
          apiLogs = `Flutterwave VTU failed: ${resData.message}`;
        }
      } catch (e: any) {
        console.error("Flutterwave bills connection failure:", e);
        apiLogs = `Flutterwave bill network error: ${e.message}`;
      }
    }

    if (providerStatus === 'FAILED') {
      // Revert wallet balance locally in case of absolute upstream refusal
      await supabaseAdmin.rpc('admin_fund_wallet', { p_user_id: userId, p_amount: rechargeAmount });
      return NextResponse.json({ success: false, message: `Biller Provider Refused: ${apiLogs}` }, { status: 422 });
    }

    // 4. Log transaction ledger record in database
    const title = type === 'airtime' ? 'Airtime Purchase' : 'Mobile Data Purchase';
    const description = `${type === 'airtime' ? 'Airtime recharge' : 'Data bundle'} of ₦${rechargeAmount.toLocaleString()} for ${phone} (${network.toUpperCase()})`;

    const { error: ledgerError } = await supabaseAdmin.from('transactions').insert([{
      user_id: userId,
      type: 'out',
      category: type === 'airtime' ? 'Airtime' : 'Data',
      title: title,
      description: `${description} via ${provider.toUpperCase()}. Ref: ${externalRef}`,
      amount: rechargeAmount,
      status: 'SUCCESS'
    }]);

    if (ledgerError) {
      console.warn("Transactions record trace failed:", ledgerError.message);
    }

    // 5. Build dynamic notification alert to customer
    await supabaseAdmin.from('user_notifications').insert([{
      user_id: userId,
      type: 'success',
      message: `₦${rechargeAmount.toLocaleString()} ${type} purchase for ${phone} was successful! (Ref: ${externalRef})`,
      is_read: false
    }]);

    return NextResponse.json({
      success: true,
      message: `${type === 'airtime' ? 'Airtime' : 'Data'} purchase was successful!`,
      reference: externalRef,
      logs: apiLogs
    });

  } catch (err: any) {
    console.error("VTU request unhandled failure:", err);
    return NextResponse.json({ success: false, message: `Server error: ${err.message}` }, { status: 500 });
  }
}
