import fs from 'fs';

const content = fs.readFileSync('src/context/PayTitanContext.tsx', 'utf8');

const providerIdx = content.indexOf('const [isProcessing, setIsProcessing] = useState(false);');
if (providerIdx === -1) {
  console.log("Could not find provider index");
  process.exit(1);
}

// Add aiFlowRef right after isProcessing
const afterIsProcessingIdx = providerIdx + 'const [isProcessing, setIsProcessing] = useState(false);'.length;
const contentWithRef = content.substring(0, afterIsProcessingIdx) + 
  '\n  const aiFlowRef = useRef<any>(null);\n' + 
  content.substring(afterIsProcessingIdx);


const startIdx = contentWithRef.indexOf('const executeAiAction = async (prompt: string, messages?: any[]): Promise<{ success: boolean; message: string; pendingTx?: any }> => {');
const endIdx = contentWithRef.indexOf('const generateHistoryPDF = (dateStr: string) => {', startIdx);

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

      if (text.includes('cancel') || text.includes('abort') || text.includes('stop') || text.includes('nevermind')) {
        aiFlowRef.current = null;
        return { success: true, message: "Action cancelled. How else can I assist you today?" };
      }

      // Extract explicit new entities
      let amount = parseAmount(text);
      let phone = parsePhone(text);
      let network = parseNetwork(text);
      let accountNo = parseAccountNo(text);
      let recipient = parseRecipient(text);

      let intent = aiFlowRef.current?.intent || '';
      
      // Override or detect new intent if explicit
      if (text.includes('transfer') || text.includes('send') || text.includes('give')) { intent = 'transfer'; aiFlowRef.current = { intent }; }
      else if (text.includes('fund') || text.includes('deposit') || text.includes('topup') || text.includes('top up')) { intent = 'topup'; aiFlowRef.current = { intent }; }
      else if (text.includes('airtime') || text.includes('recharge')) { intent = 'airtime'; aiFlowRef.current = { intent }; }
      else if (text.includes('data') || text.includes('bundle')) { intent = 'data'; aiFlowRef.current = { intent }; }
      else if (text.includes('bill') || text.includes('electricity') || text.includes('dstv') || text.includes('gotv') || text.includes('nepa') || text.includes('tv') || text.includes('cable') || (text.includes('pay') && !intent)) { intent = 'bill'; aiFlowRef.current = { intent }; }
      else if (text.includes('card') && (text.includes('create') || text.includes('new') || text.includes('get'))) intent = 'create_card';
      else if (text.includes('card') && (text.includes('freeze') || text.includes('lock') || text.includes('block'))) intent = 'lock_card';
      else if (text.includes('card') && (text.includes('unlock') || text.includes('unfreeze'))) intent = 'unlock_card';
      else if (text.includes('vault') || text.includes('save') || text.includes('stash') || text.includes('target')) { intent = 'vault'; aiFlowRef.current = { intent }; }
      else if (text.includes('balance') || text.includes('how much') || text.includes('wallet status')) intent = 'balance';
      else if (text.includes('history') || text.includes('recent') || text.includes('transaction')) intent = 'history';
      else if (text.includes('reward') || text.includes('claim') || text.includes('earn')) intent = 'reward';
      else if (text.includes('pdf') || text.includes('statement') || text.includes('export')) intent = 'statement';

      // Profile updates
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

      if (!intent) {
        if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
          return { success: true, message: \`Hello @\${profile?.username || 'user'}! 👋\\n\\nI am Titan Smart Core. I can guide you step-by-step through transfers, bill payments, and profile updates.\\n\\nWhat would you like to do today?\` };
        }
        return { success: true, message: \`I didn't quite catch that. I am Titan Smart Core, your step-by-step financial assistant.\\n\\nYou can say "Transfer money", "Pay a bill", "Buy Airtime", or "Show my balance".\` };
      }

      // Update flow state with newly extracted data
      if (aiFlowRef.current) {
        if (amount) aiFlowRef.current.amount = amount;
        if (recipient) aiFlowRef.current.recipient = recipient;
        if (accountNo) aiFlowRef.current.accountNo = accountNo;
        if (network) aiFlowRef.current.network = network;
        if (phone) aiFlowRef.current.phone = phone;
        
        // Custom extractors for bills
        const fullText = text;
        if (fullText.includes('dstv')) { aiFlowRef.current.biller = 'DSTV Subscription'; aiFlowRef.current.cat = 'Cable TV'; }
        else if (fullText.includes('gotv')) { aiFlowRef.current.biller = 'GOTV Subscription'; aiFlowRef.current.cat = 'Cable TV'; }
        else if (fullText.includes('startimes')) { aiFlowRef.current.biller = 'StarTimes'; aiFlowRef.current.cat = 'Cable TV'; }
        else if (fullText.includes('electricity') || fullText.includes('nepa')) { aiFlowRef.current.biller = 'Prepaid Electricity'; aiFlowRef.current.cat = 'Electricity'; }
      }

      switch (intent) {
        case 'transfer': {
          const state = aiFlowRef.current;
          if (!state.amount) return { success: true, message: "Okay, let's make a transfer. How much would you like to send?" };
          let target = state.accountNo || state.recipient;
          if (!target || target.length < 3 || ['transfer','money','cash','funds'].includes(target)) return { success: true, message: \`Got it, ₦\${state.amount.toLocaleString()}. Who are you sending this to? You can provide a @username or a 10-digit bank account number.\` };
          
          if (balance < state.amount) {
            aiFlowRef.current = null;
            return { success: false, message: \`⚠️ Transfer declined: Insufficient balance. You attempted to transfer ₦\${state.amount.toLocaleString()} but your balance is ₦\${balance.toLocaleString()}.\` };
          }

          const isBank = !!state.accountNo;
          aiFlowRef.current = null; // Clear state on success
          return {
            success: true,
            message: \`Great. Let's authorize your transfer of **₦\${state.amount.toLocaleString()}** to **\${isBank ? 'Account ' + target : '@' + target}**. Please enter your security PIN to confirm.\`,
            pendingTx: { type: 'transfer', amount: state.amount, recipient: target, note: isBank ? 'Smart AI Bank Transfer' : 'Smart AI Automated Transfer' }
          };
        }

        case 'topup': {
          const state = aiFlowRef.current;
          if (!state.amount) return { success: true, message: "Sure, let's fund your wallet. How much do you want to deposit?" };
          
          aiFlowRef.current = null;
          return {
            success: true,
            message: \`Initializing gateway. Let's authorize a wallet deposit of **₦\${state.amount.toLocaleString()}** with your security PIN.\`,
            pendingTx: { type: 'topup', amount: state.amount, recipient: profile?.id || 'guest' }
          };
        }

        case 'airtime': {
          const state = aiFlowRef.current;
          if (!state.amount) return { success: true, message: "Let's buy airtime. How much do you want?" };
          if (!state.phone) return { success: true, message: \`₦\${state.amount.toLocaleString()} airtime. What phone number should I recharge?\` };
          if (!state.network) return { success: true, message: \`Got the number \${state.phone}. Which network is this? (MTN, Airtel, Glo, or 9mobile)\` };
          
          if (balance < state.amount) {
            aiFlowRef.current = null;
            return { success: false, message: \`⚠️ Airtime purchase declined: Insufficient balance.\` };
          }
          
          aiFlowRef.current = null;
          return {
            success: true,
            message: \`Ready to recharge. Let's authorize **₦\${state.amount.toLocaleString()}** **\${state.network}** airtime for **\${state.phone}**.\`,
            pendingTx: { type: 'airtime', amount: state.amount, recipient: state.phone, extra: { network: state.network, biller: \`\${state.network} Airtime VTU\`, category: 'Airtime' } }
          };
        }

        case 'data': {
          const state = aiFlowRef.current;
          if (!state.amount) state.amount = 1000;
          if (!state.phone) return { success: true, message: \`Let's buy a data bundle. What phone number should I buy data for?\` };
          if (!state.network) return { success: true, message: \`Which network is \${state.phone} on?\` };
          
          if (balance < state.amount) {
            aiFlowRef.current = null;
            return { success: false, message: \`⚠️ Data purchase declined: Insufficient balance.\` };
          }
          
          aiFlowRef.current = null;
          return {
            success: true,
            message: \`Preparing data subscription. Let's authorize **₦\${state.amount.toLocaleString()}** for **\${state.network}** data bundle for **\${state.phone}**.\`,
            pendingTx: { type: 'data', amount: state.amount, recipient: state.phone, extra: { network: state.network, biller: \`\${state.network} Mobile Data bundle\`, category: 'Data' } }
          };
        }

        case 'bill': {
          const state = aiFlowRef.current;
          if (!state.biller) return { success: true, message: "Let's pay a bill. Which service are you paying for? (e.g., DSTV, GOTV, Electricity)" };
          if (!state.amount) return { success: true, message: \`How much would you like to pay for \${state.biller}?\` };
          
          if (balance < state.amount) {
            aiFlowRef.current = null;
            return { success: false, message: \`⚠️ Bill payment declined: Insufficient balance.\` };
          }
          
          const biller = state.biller;
          const cat = state.cat;
          aiFlowRef.current = null;
          return {
            success: true,
            message: \`Preparing bill payment. Let's authorize **₦\${state.amount.toLocaleString()}** for **\${biller}**.\`,
            pendingTx: { type: 'data', amount: state.amount, recipient: profile?.id || 'guest', extra: { network: biller, biller, category: cat } }
          };
        }

        case 'vault': {
          const state = aiFlowRef.current;
          if (!state.amount) return { success: true, message: "Let's open a Smart Vault. How much would you like to stash?" };
          if (balance < state.amount) {
            aiFlowRef.current = null;
            return { success: false, message: "You don't have enough balance to stash that amount into a vault." };
          }
          
          const amt = state.amount;
          aiFlowRef.current = null;
          const res = await createVault(\`AI Auto-Stash\`, amt, 'General Savings', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
          if (res) {
            await fundUserWallet(profile?.id || 'guest', -amt);
            return { success: true, message: \`🏦 I have securely stashed **₦\${amt.toLocaleString()}** into a new Smart Vault for you. It's now earning yield!\` };
          }
          return { success: false, message: "Failed to create vault." };
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

const finalContent = contentWithRef.substring(0, startIdx) + newFn + contentWithRef.substring(endIdx);
fs.writeFileSync('src/context/PayTitanContext.tsx', finalContent, 'utf8');
console.log("Successfully patched context");
