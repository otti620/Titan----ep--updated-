import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/integrations/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const status = body.status;

    if (status === "success") {
      const amount = parseFloat(body.amount);
      const email = body.user_email;
      const ref = body.transaction_id;

      if (!email || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, message: "Incomplete payment data in Payscribe payload" }, { status: 400 });
      }

      const supabaseAdmin = getSupabaseAdmin();

      // 1. Resolve registered user profile
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileErr || !profile) {
        console.warn(`Payscribe webhook received for unregistered email: ${email}`);
        return NextResponse.json({ success: false, message: "No registered PayTitan account found" }, { status: 404 });
      }

      // 2. Prevent double crediting
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .neq('status', 'FAILED')
        .filter('description', 'ilike', `%${ref}%`)
        .maybeSingle();

      if (existingTx) {
        return NextResponse.json({ success: true, message: "Trx reference reconciled previously" }, { status: 200 });
      }

      // 3. Increment database balance
      const { error: fundErr } = await supabaseAdmin.rpc('admin_fund_wallet', {
        p_user_id: profile.id,
        p_amount: amount
      });

      if (fundErr) {
        return NextResponse.json({ success: false, message: "Secure wallet increment failed" }, { status: 500 });
      }

      // 4. Record transaction logs
      await supabaseAdmin.from('transactions').insert([{
        user_id: profile.id,
        type: 'in',
        category: 'Top Up',
        title: 'Virtual Account Transfer',
        description: `Direct Bank Transfer auto-reconciled via Payscribe VA. Ref: ${ref}`,
        amount: amount,
        status: 'SUCCESS'
      }]);

      // 5. Add notifications alert
      await supabaseAdmin.from('user_notifications').insert([{
        user_id: profile.id,
        type: 'success',
        message: `₦${amount.toLocaleString()} received via Payscribe Virtual Account!`,
        is_read: false
      }]);

      return NextResponse.json({ success: true, message: `Wallet +₦${amount.toLocaleString()} credited successfully`, reference: ref });
    }

    return NextResponse.json({ success: true, message: `Payscribe event status not success` });

  } catch (err: any) {
    console.error("Payscribe webhook unhandled error:", err);
    return NextResponse.json({ success: false, message: `Server error: ${err.message}` }, { status: 500 });
  }
}
