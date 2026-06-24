"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users2, User, LayoutGrid, PiggyBank, History, Zap, Loader2, WifiOff, ShieldCheck, Sparkles } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import CirclesScreen from './screens/CirclesScreen';
import SavingsScreen from './screens/SavingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminPanel from './admin/AdminPanel';

// Sub-screens
import AirtimeScreen from './screens/AirtimeScreen';
import DataScreen from './screens/DataScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import TopUpScreen from './screens/TopUpScreen';
import BankTransferScreen from './screens/BankTransferScreen';
import TransferScreen from './screens/TransferScreen';
import RequestMoneyScreen from './screens/RequestMoneyScreen';
import QRCodeScreen from './screens/QRCodeScreen';
import TransactionDetailScreen from './screens/TransactionDetailScreen';
import OverdraftScreen from './screens/OverdraftScreen';
import TitanRecapScreen from './screens/TitanRecapScreen';
import ContactsScreen from './screens/ContactsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import KYCVerificationScreen from './screens/KYCVerificationScreen';
import SupportScreen from './screens/SupportScreen';
import ReferralScreen from './screens/ReferralScreen';
import ChangePinScreen from './screens/ChangePinScreen';
import SecuritySettingsScreen from './screens/SecuritySettingsScreen';
import AccountLimitsScreen from './screens/AccountLimitsScreen';
import SubscriptionManagerScreen from './screens/SubscriptionManagerScreen';
import CreateCircleScreen from './screens/CreateCircleScreen';
import JoinCircleScreen from './screens/JoinCircleScreen';
import CircleDetailsScreen from './screens/CircleDetailsScreen';
import TribeScreen from './screens/TribeScreen';
import SlotSelectionScreen from './screens/SlotSelectionScreen';
import BillsScreen from './screens/BillsScreen';
import CableTVScreen from './screens/CableTVScreen';
import ElectricityScreen from './screens/ElectricityScreen';
import BettingScreen from './screens/BettingScreen';
import MerchantModeScreen from './screens/MerchantModeScreen';
import RewardsScreen from './screens/RewardsScreen';
import TitanAIScreen from './screens/TitanAIScreen';
import TitanNearbyScreen from './screens/TitanNearbyScreen';
import TitanMiniBridge from './screens/TitanMiniBridge';
import LegalScreen from './LegalScreen';
import ActionDrawer from './ActionDrawer';
import RewardPopup from './RewardPopup';
import InitialNotificationPrompt from './InitialNotificationPrompt';
import { usePayTitan } from '../../context/PayTitanContext';
import PayTitanLogo from './PayTitanLogo';
import { hapticFeedback, cn } from '../../lib/utils';
import { sendAppNotification } from '../../lib/notifications';
import { toast } from 'sonner';

export default function MainAppShell({ onLogout }: { onLogout: () => void }) {
  const { 
    isAdmin, 
    transactions, 
    rewardQueue, 
    closeRewardPopup, 
    privacy, 
    updatePrivacy, 
    isMerchantMode, 
    isProcessing, 
    networkStatus, 
    settings,
    profile,
    claimDailyReward,
    showNotification,
    circles
  } = usePayTitan();
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [drawerScreen, setDrawerScreen] = useState<string | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [transferHandle, setTransferHandle] = useState('');

  const currentCircle = circles.find(c => c.id === selectedCircle?.id) || selectedCircle;

  // Auto credit the 1 Naira daily interactive check-in login bonus on launch
  useEffect(() => {
    if (!profile) return;
    
    const awardDailyBonus = async () => {
      const todayString = new Date().toDateString();
      const lastCheckKey = `pt_daily_checked_${profile.id}`;
      const checkedDeviceToday = localStorage.getItem(lastCheckKey);
      
      if (checkedDeviceToday === todayString) {
        return; 
      }

      const lastCheckIn = profile.last_check_in ? new Date(profile.last_check_in) : null;
      if (lastCheckIn && lastCheckIn.toDateString() === todayString) {
        localStorage.setItem(lastCheckKey, todayString);
        return;
      }

      const result = await claimDailyReward();
      if (result && result.success) {
        localStorage.setItem(lastCheckKey, todayString);
        toast.success("🎉 Interactive Login Bonus! +₦1.00 added to your balance.", {
          description: "Thank you for checking in on PayTitan today!",
          duration: 7000
        });
        showNotification({
          type: 'success',
          title: 'Loyalty Bonus',
          description: '₦1.00 Daily Interactive Login Bonus claimed successfully!'
        });
      }
    };

    const delayTimer = setTimeout(() => {
      awardDailyBonus();
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, [profile, claimDailyReward, showNotification]);

  useEffect(() => {
    if (settings?.global_broadcast) {
      const broadcast = settings.global_broadcast;
      const lastBroadcast = localStorage.getItem('paytitan_last_broadcast');
      
      if (broadcast.timestamp !== lastBroadcast) {
        sendAppNotification("System Broadcast", broadcast.message, "⚠️");
        localStorage.setItem('paytitan_last_broadcast', broadcast.timestamp);
      }
    }
  }, [settings?.global_broadcast]);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'circles', label: 'Tribe', icon: Users2 },
    { id: 'payments', label: 'Pay', icon: LayoutGrid },
    { id: 'rewards', label: 'Rewards', icon: Sparkles },
  ];

  const handleNavigate = (screen: string) => {
    if (isProcessing) return; // Block navigation while critical processing is happening
    hapticFeedback('medium');
    if (['home', 'payments', 'circles', 'savings', 'profile'].includes(screen)) {
      setActiveTab(screen);
      setDrawerScreen(null);
    } else if (screen.startsWith('transfer-')) {
      setTransferHandle(screen.substring(9));
      setDrawerScreen('transfer');
    } else if (screen.startsWith('scan-')) {
      setDrawerScreen('qr-code');
    } else {
      setDrawerScreen(screen);
    }
  };

  const handleGesture = React.useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // 2-finger tap detection
    if ('touches' in e && e.touches.length === 2) {
      hapticFeedback('heavy');
      updatePrivacy('hideBalance', !privacy.hideBalance);
    }
  }, [privacy.hideBalance, updatePrivacy]);

  if (settings?.maintenance_mode && !isAdmin) {
    return (
      <div className="flex flex-col h-full w-full bg-background text-foreground items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-[32px] bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
           <Zap size={48} strokeWidth={1.5} />
        </div>
        <div className="space-y-4">
           <h1 className="text-3xl font-black tracking-tighter">System Upgrade</h1>
           <p className="text-muted-foreground leading-relaxed font-medium">
             PayTitan is currently undergoing scheduled maintenance to improve our core financial infrastructure.
           </p>
           {settings.announcement && (
             <div className="p-6 bg-black/5 dark:bg-white/5 rounded-[24px] border border-border text-sm font-bold text-indigo-500 italic">
               "{settings.announcement}"
             </div>
           )}
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black pt-4">Expected downtime: 2 hours • concierge@paytitan.co</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden"
      onTouchStart={handleGesture}
    >
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {showAdmin ? (
            <motion.div 
              key="admin"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute inset-0 z-50 bg-[#0F172A]"
            >
              <AdminPanel onBack={() => setShowAdmin(false)} />
            </motion.div>
          ) : isMerchantMode ? (
            <motion.div 
               key="merchant"
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               className="absolute inset-0 z-40 bg-[#F8F9FC] dark:bg-black"
            >
               <MerchantModeScreen onBack={() => handleNavigate('home')} />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar bg-background"
            >
              <div className="pb-32 min-h-full">
                {activeTab === 'home' && <HomeScreen onNavigate={handleNavigate} />}
                {activeTab === 'payments' && <PaymentsScreen onBack={() => setActiveTab('home')} onNavigate={handleNavigate} />}
                {activeTab === 'circles' && (
                  <CirclesScreen 
                    onCreate={() => setDrawerScreen('create-circle')} 
                    onJoin={() => setDrawerScreen('join-circle')}
                    onSelectCircle={(circle) => {
                      setSelectedCircle(circle);
                      setDrawerScreen('tribe-hub');
                    }}
                  />
                )}
                {activeTab === 'rewards' && <RewardsScreen />}
                {activeTab === 'profile' && <ProfileScreen onLogout={onLogout} isAdmin={isAdmin} onAdmin={() => setShowAdmin(true)} onEdit={() => setDrawerScreen('edit-profile')} onKYC={() => setDrawerScreen('kyc')} onSupport={() => setDrawerScreen('support')} onReferral={() => setDrawerScreen('referral')} onChangePin={() => setDrawerScreen('change-pin')} onSecurity={() => setDrawerScreen('security')} onSubscriptions={() => setDrawerScreen('subscriptions')} onNavigate={handleNavigate} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Titan Mini Bridge */}
      <AnimatePresence>
        {!drawerScreen && !isMerchantMode && !showAdmin && (
          <TitanMiniBridge onOpenFull={() => handleNavigate('titan-ai')} />
        )}
      </AnimatePresence>

      {/* iOS styled Bottom Tab Bar */}
      {!showAdmin && (
        <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-xl border-t border-border pt-2"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="w-full max-w-md flex justify-around items-center px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              if (tab.id === 'payments') {
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { hapticFeedback('heavy'); setActiveTab('payments'); }}
                    className="flex flex-col items-center gap-[4px] flex-1 py-1 group"
                  >
                    <div className="w-12 h-12 bg-indigo-500 rounded-[14px] flex items-center justify-center text-white shadow-sm transition-transform -mt-6 group-active:scale-95 duration-150 ios-spring">
                      <PayTitanLogo size={28} />
                    </div>
                  </button>
                );
              }

              return (
                <button 
                  key={tab.id} 
                  onClick={() => { hapticFeedback('light'); setActiveTab(tab.id); }} 
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 py-1 transition-transform active:scale-95 duration-150 ios-spring",
                    isActive ? "text-indigo-500" : "text-muted-foreground saturate-50"
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon 
                      size={25} 
                      strokeWidth={isActive ? 2 : 1.5} 
                      fill={isActive ? 'currentColor' : 'none'} 
                    />
                  </motion.div>
                  <span className={cn("text-[10px] font-medium tracking-wide mt-0.5", isActive ? "font-semibold" : "")}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
            
            <button 
              onClick={() => { hapticFeedback('light'); setActiveTab('profile'); }}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-1 transition-transform active:scale-95 duration-150 ios-spring",
                activeTab === 'profile' ? "text-indigo-500" : "text-muted-foreground saturate-50"
              )}
            >
              <motion.div
                 animate={{ scale: activeTab === 'profile' ? 1.1 : 1 }}
                 transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                 <User 
                   size={25} 
                   strokeWidth={activeTab === 'profile' ? 2 : 1.5} 
                   fill={activeTab === 'profile' ? 'currentColor' : 'none'} 
                 />
              </motion.div>
              <span className={cn("text-[10px] font-medium tracking-wide mt-0.5", activeTab === 'profile' ? "font-semibold" : "")}>
                Profile
              </span>
            </button>
          </div>
        </div>
      )}

      <ActionDrawer 
        isOpen={!!drawerScreen} 
        onClose={() => setDrawerScreen(null)}
        fullScreen={['titan-ai', 'titan-nearby', 'transfer', 'bank-transfer', 'request-money', 'history', 'topup', 'airtime', 'data', 'notifications', 'qr-code', 'edit-profile', 'kyc', 'support', 'referral', 'security', 'subscriptions', 'create-circle', 'join-circle', 'tribe-hub', 'bills', 'cable-tv', 'electricity', 'betting', 'limits', 'month-recap', 'year-recap', 'contacts', 'legal'].includes(drawerScreen || '')}
      >
        <div className="min-h-[400px]">
          {drawerScreen === 'legal' && <LegalScreen onClose={() => setDrawerScreen(null)} />}
          {drawerScreen === 'titan-ai' && <TitanAIScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'titan-nearby' && <TitanNearbyScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'contacts' && <ContactsScreen onBack={() => setDrawerScreen(null)} onSelect={(handle) => { setTransferHandle(handle.startsWith('profile-') ? handle.substring(8) : handle); setDrawerScreen('transfer'); }} />}
          {drawerScreen === 'overdraft' && <OverdraftScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'month-recap' && <TitanRecapScreen type="month" onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'year-recap' && <TitanRecapScreen type="year" onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'topup' && <TopUpScreen onBack={() => setDrawerScreen(null)} onSuccess={() => setDrawerScreen(null)} />}
          {drawerScreen === 'history' && <TransactionHistoryScreen onBack={() => setDrawerScreen(null)} onSelectTransaction={(id) => setDrawerScreen(`tx-${id}`)} />}
          {drawerScreen === 'transfer' && <TransferScreen onBack={() => { setDrawerScreen(null); setTransferHandle(''); }} initialHandle={transferHandle} />}
          {drawerScreen === 'bank-transfer' && <BankTransferScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'request-money' && <RequestMoneyScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'bills' && (
            <BillsScreen 
              onBack={() => setDrawerScreen(null)} 
              onSelectCategory={(cat) => {
                if (cat === 'Airtime') setDrawerScreen('airtime');
                if (cat === 'Electricity') setDrawerScreen('electricity');
                if (cat === 'Cable TV') setDrawerScreen('cable-tv');
                if (cat === 'Data') setDrawerScreen('data');
                if (cat === 'Gaming') setDrawerScreen('betting');
              }} 
            />
          )}
          {drawerScreen === 'cable-tv' && <CableTVScreen onBack={() => setDrawerScreen('bills')} />}
          {drawerScreen === 'electricity' && <ElectricityScreen onBack={() => setDrawerScreen('bills')} />}
          {drawerScreen === 'betting' && <BettingScreen onBack={() => setDrawerScreen('bills')} />}
          {drawerScreen === 'qr-code' && <QRCodeScreen onBack={() => setDrawerScreen(null)} onScan={(handle) => { setTransferHandle(handle); setDrawerScreen('transfer'); }} />}
          {drawerScreen === 'airtime' && <AirtimeScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'data' && <DataScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'notifications' && <NotificationsScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'edit-profile' && <EditProfileScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'limits' && <AccountLimitsScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'kyc' && <KYCVerificationScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'support' && <SupportScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'referral' && <ReferralScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'change-pin' && <ChangePinScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'security' && <SecuritySettingsScreen onBack={() => setDrawerScreen(null)} onChangePin={() => setDrawerScreen('change-pin')} />}
          {drawerScreen === 'subscriptions' && <SubscriptionManagerScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'create-circle' && <CreateCircleScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'join-circle' && <JoinCircleScreen onBack={() => setDrawerScreen(null)} />}
          {drawerScreen === 'tribe-hub' && currentCircle && <TribeScreen tribe={currentCircle} onBack={() => setDrawerScreen(null)} onSelectFeature={(f) => setDrawerScreen(f === 'ajo' ? 'circle-details' : f)} />}
          {drawerScreen === 'circle-details' && currentCircle && <CircleDetailsScreen circle={currentCircle} onBack={() => setDrawerScreen('tribe-hub')} onSelectSlot={() => setDrawerScreen('slot-selection')} />}
          {drawerScreen === 'slot-selection' && currentCircle && <SlotSelectionScreen circle={currentCircle} onBack={() => setDrawerScreen('circle-details')} onConfirm={() => setDrawerScreen('circle-details')} />}
          
          {drawerScreen?.startsWith('tx-') && (
            <TransactionDetailScreen 
              transaction={transactions.find(t => t.id === drawerScreen.substring(3))} 
              onBack={() => setDrawerScreen('history')} 
              onSplit={() => setDrawerScreen(`split-${drawerScreen.substring(3)}`)}
              onRepeat={() => {
                const tx = transactions.find(t => t.id === drawerScreen.substring(3)) as any;
                if (tx) {
                  const handle = tx.recipient_username || (tx.title && tx.title.includes('@') ? tx.title.split('@')[1] : null);
                  if (handle) {
                    handleNavigate(`transfer-${handle}`);
                  } else {
                    handleNavigate('transfer');
                  }
                }
              }}
            />
          )}
        </div>
      </ActionDrawer>

      {/* Reward Popup Manager */}
      <RewardPopup 
        isOpen={rewardQueue.length > 0} 
        onClose={() => {
          if (rewardQueue.length > 0) {
            sendAppNotification("Reward Claimed!", `₦${rewardQueue[0].amount.toLocaleString()} added to your balance.`, "🎁");
            closeRewardPopup();
          }
        }} 
        amount={rewardQueue.length > 0 ? rewardQueue[0].amount : 0} 
        title={rewardQueue.length > 0 ? rewardQueue[0].title : ''} 
        description={rewardQueue.length > 0 ? rewardQueue[0].description : ''} 
      />

      <InitialNotificationPrompt />

      {/* Persistence Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="headline">Securing Transaction</p>
              <p className="subheadline text-muted-foreground">Please do not close Titan...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Status bar */}
      <AnimatePresence>
        {networkStatus !== 'online' && (
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className={cn(
              "fixed top-0 inset-x-0 z-[101] flex items-center justify-center px-4 py-2 pt-[env(safe-area-inset-top,8px)] transition-colors gap-2",
              networkStatus === 'offline' ? "bg-amber-500 text-white" : "bg-indigo-500 text-white"
            )}
          >
            <Loader2 size={12} className="animate-spin shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-tighter">
              {networkStatus === 'offline' ? 'Weak Network - Pending Sync' : 'Reconnecting... Your request is processing safely.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Alert Overlay - Removing full screen blocking offline, instead we just rely on the banner and let users view cached data */}
    </div>
  );
}