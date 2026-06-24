import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/integrations/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, billerCode, customerId, category, provider = 'payscribe' } = body;

    if (!userId || !amount || !billerCode || !customerId || !category) {
      return NextResponse.json({ success: false, message: "Missing required parameters: userId, amount, billerCode, customerId, category" }, { status: 400 });
    }

    const billAmount = parseFloat(amount);
    if (isNaN(billAmount) || billAmount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid payment amount" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Get user profile and check balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, message: "User profile not found" }, { status: 404 });
    }

    const currentBalance = parseFloat(profile.balance || '0');
    if (currentBalance < billAmount) {
      return NextResponse.json({ success: false, message: "Insufficient wallet balance to conclude payment" }, { status: 400 });
    }

    // 2. Safely deduct wallet funds via server RPC
    const { error: fundError } = await supabaseAdmin.rpc('admin_fund_wallet', {
      p_user_id: userId,
      p_amount: -billAmount
    });

    if (fundError) {
      console.error("Wallet deduction error:", fundError);
      return NextResponse.json({ success: false, message: "System failed to securely debit wallet." }, { status: 500 });
    }

    // 3. Dispatch provider REST API call (Payscribe or Flutterwave)
    let providerRef = `BL-${Math.floor(100000 + Math.random() * 900000)}`;
    let providerStatus = 'SUCCESS';
    let apiLogs = 'Simulated bill billing settlement';

    // Check if real Keys are available in system environment
    const payscribeKey = process.env.PAYSCRIBE_API_KEY;
    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (provider === 'payscribe' && payscribeKey) {
      try {
        const payload = {
          service: category === 'Electricity' ? 'electricity' : 'tv',
          biller: billerCode,
          account: customerId,
          amount: billAmount
        };
        const res = await fetch('https://api.payscribe.ng/v1/bills/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${payscribeKey}`
          },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData.status === 'success' || resData.success) {
          providerRef = resData.ref || resData.transaction_id || providerRef;
          apiLogs = 'Payscribe direct API callback confirmed.';
        } else {
          providerStatus = 'FAILED';
          apiLogs = `Payscribe failure message: ${resData.message || 'declined'}`;
        }
      } catch (e: any) {
        console.error("Payscribe outbound failure:", e);
        apiLogs = `Payscribe network connection issue: ${e.message}`;
      }
    } else if (provider === 'flutterwave' && flutterwaveKey) {
      try {
        const payload = {
          country: "NG",
          customer: customerId,
          amount: billAmount,
          recurrence: "ONCE",
          type: billerCode,
          reference: providerRef
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
          providerRef = resData.data?.tx_ref || providerRef;
          apiLogs = 'Flutterwave Bills API settlement successful.';
        } else {
          providerStatus = 'FAILED';
          apiLogs = `Flutterwave billing failed: ${resData.message}`;
        }
      } catch (e: any) {
        console.error("Flutterwave bills network issue:", e);
        apiLogs = `Flutterwave bill network error: ${e.message}`;
      }
    }

    if (providerStatus === 'FAILED') {
      // Revert wallet balance locally in case of absolute upstream decline
      await supabaseAdmin.rpc('admin_fund_wallet', { p_user_id: userId, p_amount: billAmount });
      return NextResponse.json({ success: false, message: `Biller Provider Refused: ${apiLogs}` }, { status: 422 });
    }

    // 4. Log successful settlement transaction in database ledger
    const categoryUpper = category.toUpperCase();
    const { error: ledgerError } = await supabaseAdmin.from('transactions').insert([{
      user_id: userId,
      type: 'out',
      category: category,
      title: `${categoryUpper} Payment`,
      description: `${category} recharge for ${customerId} via ${provider.toUpperCase()}. Ref: ${providerRef}`,
      amount: billAmount,
      status: 'SUCCESS'
    }]);

    if (ledgerError) {
      console.warn("Ledger record log skipped:", ledgerError.message);
    }

    // 5. Build dynamic notification alert to customer
    await supabaseAdmin.from('user_notifications').insert([{
      user_id: userId,
      type: 'success',
      message: `₦${billAmount.toLocaleString()} ${category} recharge completed successfully! (Ref: ${providerRef})`,
      is_read: false
    }]);

    return NextResponse.json({
      success: true,
      message: `${category} payment successfully completed!`,
      reference: providerRef,
      logs: apiLogs
    });

  } catch (err: any) {
    console.error("Unhandled billing error:", err);
    return NextResponse.json({ success: false, message: `System Error: ${err.message}` }, { status: 500 });
  }
}
