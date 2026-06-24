import React from 'react';
import { X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalScreenProps {
  onClose: () => void;
}

const LegalScreen: React.FC<LegalScreenProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#1A2130] text-white flex flex-col font-sans h-[100dvh]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative z-10 shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 active:scale-95 transition-transform"
        >
          <X size={20} />
        </button>
        <h2 className="text-[13px] font-black uppercase tracking-widest absolute left-1/2 -translate-x-1/2">
          Legal & Policies
        </h2>
        <div className="w-10 h-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="p-6 pb-24 space-y-10 relative z-10">
          
          {/* Header Icon */}
          <div className="flex flex-col items-center justify-center pt-4 pb-2">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <Shield size={32} className="text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PayTitan Terms</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-bold">
              Last Updated: August 2026
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest border-l-2 border-indigo-400 pl-3">
              PayTitan Terms of Service
            </h3>
            
            <div className="space-y-6 text-sm text-white/70 leading-relaxed font-medium">
              <div>
                <h4 className="text-base text-white font-bold mb-2">1. INTRODUCTION</h4>
                <p>Welcome to PayTitan. By accessing or using PayTitan’s services, applications, websites, or related financial technology solutions, you agree to comply with and be bound by these Terms of Service. If you do not agree with these Terms, you must discontinue use of the platform immediately.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">2. ELIGIBILITY</h4>
                <p>Users must:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Be at least 18 years old or of legal age under applicable laws</li>
                  <li>Provide accurate registration information</li>
                  <li>Complete identity verification requirements where applicable</li>
                </ul>
                <p className="mt-2">PayTitan reserves the right to deny, suspend, or terminate access where false, misleading, or incomplete information is provided.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">3. SERVICES</h4>
                <p>PayTitan provides digital financial technology services including but not limited to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Wallet services</li>
                  <li>Money transfers</li>
                  <li>Bill payments</li>
                  <li>Airtime and data purchases</li>
                  <li>Savings-related tools</li>
                  <li>Username-based transfers</li>
                  <li>Group financial tools and related services</li>
                </ul>
                <p className="mt-2">Certain services may be provided through regulated third-party financial institutions or infrastructure partners.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">4. ACCOUNT RESPONSIBILITY</h4>
                <p>Users are solely responsible for:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Maintaining the confidentiality of login credentials</li>
                  <li>Securing devices linked to their account</li>
                  <li>Reviewing transaction activity regularly</li>
                </ul>
                <p className="mt-2">Any activity performed through a user account may be treated as authorized unless proven otherwise through PayTitan’s review process.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">5. TRANSACTION PROCESSING</h4>
                <p>While PayTitan aims to ensure reliable and uninterrupted transaction processing, users acknowledge that delays or failures may occasionally occur due to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Banking network issues</li>
                  <li>Third-party infrastructure downtime</li>
                  <li>Telecommunications failures</li>
                  <li>Regulatory restrictions</li>
                  <li>System maintenance</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="mt-2">PayTitan does not guarantee uninterrupted availability of services at all times.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">6. LIMITATION OF LIABILITY</h4>
                <p>To the maximum extent permitted by applicable law, PayTitan shall not be liable for:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Indirect or consequential losses</li>
                  <li>Loss of profits or opportunities</li>
                  <li>Delays caused by third-party providers</li>
                  <li>User errors, including incorrect account details</li>
                  <li>Unauthorized access resulting from compromised credentials or user negligence</li>
                  <li>Temporary service interruptions beyond reasonable control</li>
                </ul>
                <p className="mt-2 text-white/90">PayTitan’s total liability for any verified claim shall not exceed the value of the specific transaction directly related to the dispute.</p>
              </div>
              
              <div>
                <h4 className="text-base text-white font-bold mb-2">7. ACCOUNT RESTRICTIONS</h4>
                <p>PayTitan reserves the right to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Suspend accounts</li>
                  <li>Restrict transactions</li>
                  <li>Delay withdrawals</li>
                  <li>Request additional verification</li>
                  <li>Reject transactions</li>
                </ul>
                <p className="mt-2">where suspicious, fraudulent, abusive, unlawful, or high-risk activity is detected.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">8. TERMINATION</h4>
                <p>PayTitan may suspend or terminate accounts where users:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Violate these Terms</li>
                  <li>Engage in fraud or abuse</li>
                  <li>Attempt unauthorized activities</li>
                  <li>Use the platform unlawfully</li>
                </ul>
                <p className="mt-2">Termination does not eliminate outstanding obligations or ongoing investigations.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">9. MODIFICATIONS</h4>
                <p>PayTitan reserves the right to update these Terms at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">10. GOVERNING LAW</h4>
                <p>These Terms shall be governed in accordance with the laws of the Federal Republic of Nigeria.</p>
              </div>

            </div>
          </section>

          <div className="w-full h-px bg-white/10" />

          <section className="space-y-4">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest border-l-2 border-rose-400 pl-3">
              PayTitan Fraud Policy
            </h3>
            
            <div className="space-y-6 text-sm text-white/70 leading-relaxed font-medium">
              <div>
                <h4 className="text-base text-white font-bold mb-2">1. FRAUD MONITORING</h4>
                <p>PayTitan actively monitors accounts and transactions for suspicious activity using automated systems, behavioral analysis, transaction reviews, and compliance procedures.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">2. SUSPICIOUS ACTIVITY</h4>
                <p>The following may trigger account reviews or restrictions:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Unusual transaction patterns</li>
                  <li>Identity inconsistencies</li>
                  <li>Attempted unauthorized access</li>
                  <li>Chargeback abuse</li>
                  <li>Money laundering indicators</li>
                  <li>Multiple linked accounts</li>
                  <li>Use of stolen payment methods</li>
                  <li>Regulatory compliance concerns</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">3. ACCOUNT RESTRICTIONS</h4>
                <p>Where suspicious activity is detected, PayTitan may:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Temporarily freeze accounts</li>
                  <li>Restrict transfers or withdrawals</li>
                  <li>Delay processing of transactions</li>
                  <li>Request enhanced identity verification</li>
                  <li>Escalate matters to compliance teams or authorities where required</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">4. INVESTIGATIONS</h4>
                <p>Users agree to cooperate fully during investigations, including providing requested documentation or clarification where necessary.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">5. REGULATORY COOPERATION</h4>
                <p>PayTitan may share relevant information with financial institutions, regulators, law enforcement agencies, or compliance partners where legally required.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">6. LIABILITY</h4>
                <p>Users remain responsible for activities conducted through their accounts where such activity resulted from negligence, credential compromise, unauthorized sharing of account access, or violation of platform policies.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">7. FINAL DECISIONS</h4>
                <p>PayTitan reserves the right to make final determinations regarding platform abuse, suspicious activity, and compliance-related restrictions, subject to applicable laws and regulatory obligations.</p>
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-white/10" />

          <section className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest border-l-2 border-amber-400 pl-3">
              Missing Funds & Dispute Policy
            </h3>
            
            <div className="space-y-6 text-sm text-white/70 leading-relaxed font-medium">
              <div>
                <h4 className="text-base text-white font-bold mb-2">1. REPORTING ISSUES</h4>
                <p>Users must report missing funds, failed transactions, or disputed activity promptly through official PayTitan support channels.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">2. TRANSACTION REVIEWS</h4>
                <p>PayTitan may investigate reported issues by reviewing:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Transaction logs</li>
                  <li>Banking partner records</li>
                  <li>API provider responses</li>
                  <li>Device and account activity</li>
                  <li>Compliance data</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">3. THIRD-PARTY DEPENDENCIES</h4>
                <p>Certain transactions rely on third-party banks, payment processors, VTU providers, and infrastructure partners. Delays or failures caused by such third parties may impact transaction resolution timelines.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">4. REVERSALS AND RECOVERY</h4>
                <p>Where transactions fail but funds are debited, PayTitan will make reasonable efforts to facilitate reversals or recovery processes through relevant financial partners.</p>
                <p className="mt-2">However, PayTitan does not guarantee immediate reversals where delays are caused by external financial institutions or infrastructure providers.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">5. USER ERRORS</h4>
                <p>PayTitan shall not be liable for losses resulting from:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/50">
                  <li>Incorrect account details entered by users</li>
                  <li>Transfers sent to unintended recipients</li>
                  <li>Mistaken purchases</li>
                  <li>Unauthorized access resulting from user negligence</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">6. TEMPORARY RESTRICTIONS</h4>
                <p>Funds associated with disputes, investigations, chargebacks, or suspicious activity may be temporarily restricted pending review.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">7. LIMITATION OF LIABILITY</h4>
                <p className="text-white/90">To the maximum extent permitted by law, PayTitan’s liability for unresolved transaction disputes shall not exceed the value of the affected transaction directly under review.</p>
              </div>

              <div>
                <h4 className="text-base text-white font-bold mb-2">8. GOOD FAITH EFFORTS</h4>
                <p>PayTitan will make commercially reasonable efforts to resolve legitimate transaction issues fairly, transparently, and in accordance with applicable financial regulation.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default LegalScreen;
