import { useCoffeeData } from '@/hooks/useCoffeeData';
import { NextBuyerCard } from './NextBuyerCard';
import { ParticipantsList } from './ParticipantsList';
import { PurchaseHistory } from './PurchaseHistory';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Coffee, Loader2 } from 'lucide-react';

export function CoffeeSystem() {
  const { logout } = useAuth();
  const {
    participants,
    purchases,
    nextBuyer,
    loading,
    participantsError,
    purchasesError,
    addParticipant,
    updateParticipant,
    reorderParticipants,
    deleteParticipant,
    recordPurchase,
    clearPurchaseHistory,
    recordOutOfOrderPurchase,
    deletePurchase,
  } = useCoffeeData();

  if (loading && !participants.length && !purchases.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="mt-4 text-lg font-medium">Carregando sistema do café...</p>
        <p className="text-sm">Buscando dados fresquinhos!</p>
      </div>
    );
  }

  // Error state for the whole page could be handled here
  if (participantsError || purchasesError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">
        <h2 className="text-2xl font-bold mb-2">Oops! Algo deu errado.</h2>
        <p>{participantsError || purchasesError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/95 bg-fixed">
      <header className="sticky top-0 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-md">
                <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Coffee System
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              aria-label="Sair"
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-8">
            <NextBuyerCard
              nextBuyer={nextBuyer}
              participants={participants}
              onRecordPurchase={recordPurchase}
              onRecordOutOfOrderPurchase={recordOutOfOrderPurchase}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <ParticipantsList
              participants={participants}
              onAddParticipant={addParticipant}
              onUpdateParticipant={updateParticipant}
              onReorderParticipants={reorderParticipants}
              onDeleteParticipant={deleteParticipant}
              loading={loading}
            />
            <PurchaseHistory
              purchases={purchases}
              purchasesError={purchasesError}
              onClearHistory={clearPurchaseHistory}
              deletePurchase={deletePurchase}
            />
          </div>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-slate-500 dark:text-slate-600">
        <p>&copy; {new Date().getFullYear()} Coffee System. All rights reserved.</p>
      </footer>
    </div>
  );
}
