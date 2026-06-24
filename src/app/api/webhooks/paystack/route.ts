import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/integrations/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event;

    // We proceed if the event represents a successful transaction charge
    if (event === "charge.success") {
      const data = body.data;
      const amount = parseFloat(data.amount) / 100; // Paystack operates in kobo; divide by 100 to get Naira
      const email = data.customer?.email;
      const ref = data.reference;

      if (!email || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, message: "Incomplete payment data in webhook payload" }, { status: 400 });
      }

      const supabaseAdmin = getSupabaseAdmin();

      // 1. Resolve customer profile using their registered email Address
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('email', email)
        .single();

      if (profileErr || !profile) {
        console.warn(`Webhook received for unregistered customer email: ${email}`);
        return NextResponse.json({ success: false, message: "No registered PayTitan account found with this email structure" }, { status: 404 });
      }

      // 2. Prevent double-crediting by checking if reference was processed previously
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .neq('status', 'FAILED')
        .filter('description', 'ilike', `%${ref}%`)
        .maybeSingle();

      if (existingTx) {
        return NextResponse.json({ success: true, message: "Transaction reference already reconciled previously" }, { status: 200 });
      }

      // 3. Increment the user's wallet balance on our database server
      const { error: fundErr } = await supabaseAdmin.rpc('admin_fund_wallet', {
        p_user_id: profile.id,
        p_amount: amount
      });

      if (fundErr) {
        console.error("Failed to credit virtual account on db:", fundErr);
        return NextResponse.json({ success: false, message: "Database ledger insertion failed" }, { status: 500 });
      }

      // 4. Log the incoming credit item in the transaction ledgers
      const { error: ledgerErr } = await supabaseAdmin.from('transactions').insert([{
        user_id: profile.id,
        type: 'in',
        category: 'Top Up',
        title: 'Virtual Account Transfer',
        description: `Direct Bank Transfer auto-reconciled via Paystack VA. Ref: ${ref}`,
        amount: amount,
        status: 'SUCCESS'
      }]);

      if (ledgerErr) {
        console.warn("Ledger registry skipped on webhook credit:", ledgerErr.message);
      }

      // 5. Build instant user push notification alerts
      await supabaseAdmin.from('user_notifications').insert([{
        user_id: profile.id,
        type: 'success',
        message: `₦${amount.toLocaleString()} received via Virtual Account bank transfer!`,
        is_read: false
      }]);

      return NextResponse.json({ success: true, message: `Wallet +₦${amount.toLocaleString()} credited successfully`, reference: ref });
    }

    return NextResponse.json({ success: true, message: `Unmonitored event callback: ${event || 'unhandled'}` });

  } catch (err: any) {
    console.error("Paystack webhook controller failure:", err);
    return NextResponse.json({ success: false, message: `Server error: ${err.message}` }, { status: 500 });
  }
}
