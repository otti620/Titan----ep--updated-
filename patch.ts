import fs from 'fs';

const content = fs.readFileSync('src/context/PayTitanContext.tsx', 'utf8');

const startIdx = content.indexOf('const executeAiAction = async (prompt: string, messages?: any[]): Promise<{ success: boolean; message: string; pendingTx?: any }> => {');
const endIdx = content.indexOf('const generateHistoryPDF = (dateStr: string) => {', startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find start or end index");
  process.exit(1);
}

const newFn = `const executeAiAction = async (prompt: string, messages?: any[]): Promise<{ success: boolean; message: string; pendingTx?: any }> => {
    try {
      const text = prompt.toLowerCase().trim();
      
      const parseAmount = (input: string): number | null => {
        const moneyRegex = /(?:₦|ngn)?\\s*(\\d+(?:\\.\\d+)?)\\s*(k|thousand|m|million)?/i;
        const match = input.match(moneyRegex);
        if (match) {
          let num = parseFloat(match[1]);
          const suffix = (match[2] || '').toLowerCase();
          if (suffix === 'k' || suffix === 'thousand') num *= 1000;
          else if (suffix === 'm' || suffix === 'million') num *= 1000000;
          return num;
        }
        const fallbackMatch = input.match(/\\b\\d+[,.]?\\d*\\b/);
        if (fallbackMatch) return parseFloat(fallbackMatch[0].replace(/,/g, ''));
        return null;
      };

      const parsePhone = (input: string): string | null => {
        const phoneMatch = input.match(/\\b(0\\d{10}|234\\d{10}|\\+234\\d{10})\\b/);
        return phoneMatch ? phoneMatch[0] : null;
      };

      const parseNetwork = (input: string): string | null => {
        if (input.includes('mtn')) return 'MTN';
        if (input.includes('airtel')) return 'Airtel';
        if (input.includes('glo') || input.includes('globacom')) return 'Glo';
        if (input.includes('9mobile') || input.includes('etisalat')) return '9mobile';
        return null;
      };

      const parseAccountNo = (input: string): string | null => {
        const accMatch = input.match(/\\b(\\d{10})\\b/);
        return accMatch ? accMatch[1] : null;
      };

      const parseRecipient = (input: string): string | null => {
        const handleMatch = input.match(/@([a-zA-Z0-9_]+)/);
        if (handleMatch) return handleMatch[1];
        
        const toMatch = input.match(/(?:to|pay|for)\\s+([a-zA-Z0-9_]+)/i);
        if (toMatch && !['my', 'the', 'a', 'an', 'account', 'electricity', 'dstv', 'gotv', 'nepa', 'bill', 'tv', 'cable', 'airtime', 'data'].includes(toMatch[1])) {
          return toMatch[1];
        }
        
        const words = input.split(/\\s+/);
        const toIdx = words.indexOf('to');
        if (toIdx !== -1 && toIdx + 1 < words.length) {
          const rec = words[toIdx + 1] === 'account' ? (words[toIdx + 2] || '') : words[toIdx + 1];
          if (rec && !['my', 'the'].includes(rec)) return rec;
        }
        return null;
      };

      // Profile Update Direct Handling
      if ((text.includes('change') || text.includes('update') || text.includes('set')) && text.includes('name')) {
        const isUsername = text.includes('username');
        const regex = isUsername ? /(?:username to)\\s+@?([a-zA-Z0-9_]+)/i : /(?:name to)\\s+([a-zA-Z]+)/i;
        const match = text.match(regex);
        if (match && match[1]) {
          const newVal = match[1];
          if (isUsername) {
            setProfile(prev => prev ? { ...prev, username: newVal } : null);
            try { supabase.from('profiles').update({ username: newVal } as any).eq('id', profile?.id).then(); } catch(e){}
            return { success: true, message: \`👤 I've successfully updated your username to **@\${newVal}**.\` };
          } else {
            setProfile(prev => prev ? { ...prev, first_name: newVal } : null);
            try { supabase.from('profiles').update({ first_name: newVal } as any).eq('id', profile?.id).then(); } catch(e){}
            return { success: true, message: \`👤 I've successfully updated your first name to **\${newVal}**.\` };
          }
        }
        return { success: true, message: \`What would you like to change your \${isUsername ? 'username' : 'name'} to? (e.g., "Change my \${isUsername ? 'username' : 'name'} to John")\` };
      }

      // Extract current entities
      let amount = parseAmount(text);
      let phone = parsePhone(text);
      let network = parseNetwork(text);
      let accountNo = parseAccountNo(text);
      let recipient = parseRecipient(text);

      // Determine intent
      let intent = '';
      if (text.includes('transfer') || text.includes('send') || text.includes('pay') || text.includes('give')) intent = 'transfer';
      else if (text.includes('fund') || text.includes('deposit') || text.includes('topup') || text.includes('top up')) intent = 'topup';
      else if (text.includes('airtime') || text.includes('recharge')) intent = 'airtime';
      else if (text.includes('data') || text.includes('bundle')) intent = 'data';
      else if (text.includes('bill') || text.includes('electricity') || text.includes('dstv') || text.includes('gotv') || text.includes('nepa') || text.includes('tv') || text.includes('cable')) intent = 'bill';
      else if (text.includes('card') && (text.includes('create') || text.includes('new') || text.includes('get'))) intent = 'create_card';
      else if (text.includes('card') && (text.includes('freeze') || text.includes('lock') || text.includes('block'))) intent = 'lock_card';
      else if (text.includes('card') && (text.includes('unlock') || text.includes('unfreeze'))) intent = 'unlock_card';
      else if (text.includes('vault') || text.includes('save') || text.includes('stash') || text.includes('target')) intent = 'vault';
      else if (text.includes('balance') || text.includes('how much') || text.includes('wallet status')) intent = 'balance';
      else if (text.includes('history') || text.includes('recent') || text.includes('transaction')) intent = 'history';
      else if (text.includes('reward') || text.includes('claim') || text.includes('earn')) intent = 'reward';
      else if (text.includes('pdf') || text.includes('statement') || text.includes('export')) intent = 'statement';

      const lastTitan = messages && messages.length > 0 ? messages[messages.length - 1] : null;
      const lastTitanText = lastTitan?.role === 'titan' ? lastTitan.text.toLowerCase() : '';

      // Infer intent from last AI question if not explicitly stated
      if (!intent) {
        if (lastTitanText.includes('how much would you like to send') || lastTitanText.includes('who would you like to send')) intent = 'transfer';
        else if (lastTitanText.includes('how much would you like to fund') || lastTitanText.includes('how much do you want to deposit') || lastTitanText.includes('fund your wallet with')) intent = 'topup';
        else if (lastTitanText.includes('how much airtime') || lastTitanText.includes('which network') || lastTitanText.includes('what phone number')) intent = 'airtime';
        else if (lastTitanText.includes('how much data') || lastTitanText.includes('which network is')) intent = 'data';
        else if (lastTitanText.includes('which bill') || lastTitanText.includes('how much would you like to pay')) intent = 'bill';
        else if (lastTitanText.includes('how much would you like to stash')) intent = 'vault';
      }

      // Context Recovery
      const historyText = messages ? messages.slice(-3).map(m => m.text.toLowerCase()).join(' ') : '';
      if (intent) {
        if (!amount) amount = parseAmount(historyText);
        if (!recipient && intent === 'transfer') recipient = parseRecipient(historyText);
        if (!accountNo && intent === 'transfer') accountNo = parseAccountNo(historyText);
        if (!network && (intent === 'airtime' || intent === 'data')) network = parseNetwork(historyText);
        if (!phone && (intent === 'airtime' || intent === 'data')) phone = parsePhone(historyText);
      }

      // Intent Handlers
      switch (intent) {
        case 'transfer': {
          let target = accountNo || recipient;
          if (target && target.length < 3) target = null; // discard noise
          
          if (!amount) return { success: true, message: "Sure, I can help with a transfer. How much would you like to send?" };
          if (!target) return { success: true, message: \`Got it, ₦\${amount.toLocaleString()}. Who would you like to send this to? You can provide a @username or a 10-digit bank account number.\` };
          
          if (balance < amount) return { success: false, message: \`⚠️ Transfer declined: Insufficient balance. You attempted to transfer ₦\${amount.toLocaleString()} but your balance is ₦\${balance.toLocaleString()}.\` };

          const isBank = !!accountNo;
          return {
            success: true,
            message: \`Double-checking credentials. Let's authorize your transfer of **₦\${amount.toLocaleString()}** to **\${isBank ? 'Account ' + target : '@' + target}**.\`,
            pendingTx: { type: 'transfer', amount, recipient: target, note: isBank ? 'Smart AI Bank Transfer' : 'Smart AI Automated Transfer' }
          };
        }

        case 'topup': {
          if (!amount) return { success: true, message: "How much would you like to fund your wallet with?" };
          return {
            success: true,
            message: \`Initializing gateway. Let's authorize a wallet deposit of **₦\${amount.toLocaleString()}** with your security PIN.\`,
            pendingTx: { type: 'topup', amount, recipient: profile?.id || 'guest' }
          };
        }

        case 'airtime': {
          if (!amount) return { success: true, message: "How much airtime would you like to buy?" };
          if (!phone) return { success: true, message: \`₦\${amount.toLocaleString()} airtime. What phone number should I recharge?\` };
          if (!network) return { success: true, message: \`Okay, for \${phone}. Which network? (MTN, Airtel, Glo, or 9mobile)\` };
          
          if (balance < amount) return { success: false, message: \`⚠️ Airtime purchase declined: Insufficient balance.\` };
          return {
            success: true,
            message: \`Ready to recharge. Let's authorize **₦\${amount.toLocaleString()}** **\${network}** airtime for **\${phone}**.\`,
            pendingTx: { type: 'airtime', amount, recipient: phone, extra: { network, biller: \`\${network} Airtime VTU\`, category: 'Airtime' } }
          };
        }

        case 'data': {
          if (!amount) amount = 1000; // default assumption for simplicity if they just say "buy data for 081..."
          if (!phone) return { success: true, message: \`What phone number should I buy data for?\` };
          if (!network) return { success: true, message: \`Which network is \${phone} on?\` };
          
          if (balance < amount) return { success: false, message: \`⚠️ Data purchase declined: Insufficient balance.\` };
          return {
            success: true,
            message: \`Preparing data subscription. Let's authorize **₦\${amount.toLocaleString()}** for **\${network}** data bundle for **\${phone}**.\`,
            pendingTx: { type: 'data', amount, recipient: phone, extra: { network, biller: \`\${network} Mobile Data bundle\`, category: 'Data' } }
          };
        }

        case 'bill': {
          let biller = '';
          let cat = 'Bills';
          const fullText = (historyText + ' ' + text).toLowerCase();
          if (fullText.includes('dstv')) { biller = 'DSTV Subscription'; cat = 'Cable TV'; }
          else if (fullText.includes('gotv')) { biller = 'GOTV Subscription'; cat = 'Cable TV'; }
          else if (fullText.includes('startimes')) { biller = 'StarTimes'; cat = 'Cable TV'; }
          else if (fullText.includes('electricity') || fullText.includes('nepa')) { biller = 'Prepaid Electricity'; cat = 'Electricity'; }
          
          if (!biller) return { success: true, message: "Which bill would you like to pay? (e.g., DSTV, GOTV, Electricity)" };
          if (!amount) return { success: true, message: \`How much would you like to pay for \${biller}?\` };
          
          if (balance < amount) return { success: false, message: \`⚠️ Bill payment declined: Insufficient balance.\` };
          return {
            success: true,
            message: \`Preparing bill payment. Let's authorize **₦\${amount.toLocaleString()}** for **\${biller}**.\`,
            pendingTx: { type: 'data', amount, recipient: profile?.id || 'guest', extra: { network: biller, biller, category: cat } }
          };
        }

        case 'create_card': {
          if (createCard) {
            const res = await createCard();
            if (res) return { success: true, message: \`💳 Your new PayTitan Virtual USD Card has been successfully generated and activated for global spending!\` };
          }
          return { success: false, message: "Failed to generate your virtual card. Please try again later." };
        }

        case 'lock_card': {
          if (!cards || cards.length === 0 || !toggleCardLock) return { success: false, message: "You do not currently have any active cards to freeze." };
          const res = await toggleCardLock(cards[0].id);
          if (res) return { success: true, message: \`🔒 I have instantly frozen your virtual card (*\${cards[0].last4}). It can no longer be charged. Type 'unlock card' to reverse this.\` };
          return { success: false, message: "Failed to lock card." };
        }

        case 'unlock_card': {
          if (!cards || cards.length === 0 || !toggleCardLock) return { success: false, message: "You do not currently have any active cards." };
          const res = await toggleCardLock(cards[0].id);
          if (res) return { success: true, message: \`🔓 I have unfrozen your virtual card (*\${cards[0].last4}). It is now ready for transactions.\` };
          return { success: false, message: "Failed to unlock card." };
        }

        case 'vault': {
          if (!amount) return { success: true, message: "How much would you like to stash in a vault?" };
          if (balance < amount) return { success: false, message: "You don't have enough balance to stash that amount into a vault." };
          
          const res = await createVault(\`AI Auto-Stash\`, amount, 'General Savings', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
          if (res) {
            await fundUserWallet(profile?.id || 'guest', -amount);
            return { success: true, message: \`🏦 I have securely stashed **₦\${amount.toLocaleString()}** into a new Smart Vault for you. It's now earning yield!\` };
          }
          return { success: false, message: "Failed to create vault." };
        }

        case 'balance': {
          return { success: true, message: \`Your current Wallet Balance is **₦\${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}**.\` };
        }

        case 'history': {
          if (transactions.length === 0) return { success: true, message: "You have no recent transactions on your ledger." };
          const recent = transactions.slice(0, 3);
          let txMsg = \`Here are your most recent transactions:\\n\\n\`;
          recent.forEach(t => {
            const sym = t.type === 'in' ? '+' : '-';
            txMsg += \`• **\${t.title}**: \${sym}₦\${t.amount.toLocaleString()}\\n\`;
          });
          return { success: true, message: txMsg };
        }

        case 'reward': {
          if (!claimDailyReward) return { success: false, message: "Reward service unavailable." };
          const res = await claimDailyReward();
          if (res.success) return { success: true, message: \`🎁 You've successfully claimed your daily yield check-in reward! The funds have been added to your wallet.\` };
          return { success: false, message: "You have already claimed your reward recently." };
        }

        case 'statement': {
          generateHistoryPDF('Smart AI Request');
          return { success: true, message: \`📄 Your account statement PDF is being generated securely and will download momentarily.\` };
        }

        default: {
          if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
            return { success: true, message: \`Hello @\${profile?.username || 'user'}! 👋\\n\\nI am Titan Smart Core. I can guide you through transfers, bill payments, and profile updates. Just let me know what you want to do!\` };
          }
          if (text.includes('help') || text.includes('commands') || text.includes('what can you do')) {
            return { success: true, message: \`🛠️ **Titan Smart Core Command Suite**\\n\\n1. **Transfers**: 'Send 3k' or 'Transfer money'\\n2. **Wallet Topup**: 'Fund wallet'\\n3. **Bills & Airtime**: 'Buy airtime' or 'Pay electricity'\\n4. **Cards**: 'Create a new card' or 'Freeze my card'\\n5. **Savings**: 'Stash 50k in a vault'\\n6. **Ledger**: 'Show my balance'\` };
          }
          
          return {
            success: true,
            message: \`I didn't quite catch that. I am Titan Smart Core, your financial assistant. I can help you send money, pay bills, buy airtime, and update your profile.\\n\\nWhat would you like to do?\`
          };
        }
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: "My heuristic engine encountered an error processing your request." };
    }
  };

  `;

const finalContent = content.substring(0, startIdx) + newFn + content.substring(endIdx);
fs.writeFileSync('src/context/PayTitanContext.tsx', finalContent, 'utf8');
console.log("Successfully patched context");
