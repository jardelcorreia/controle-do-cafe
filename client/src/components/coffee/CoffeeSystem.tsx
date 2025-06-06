import { useCoffeeData } from '@/hooks/useCoffeeData';
import { NextBuyerCard } from './NextBuyerCard';
import { ParticipantsList } from './ParticipantsList';
import { PurchaseHistory } from './PurchaseHistory';

export function CoffeeSystem() {
  const {
    participants,
    purchases,
    nextBuyer,
    loading,
    addParticipant,
    updateParticipant,
    reorderParticipants,
    deleteParticipant,
    recordPurchase,
    clearPurchaseHistory,
  } = useCoffeeData();

  if (loading) {
    return (
      <div className="min-h-screen coffee-pattern">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg">Carregando sistema do café...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coffee-pattern">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100">
            ☕ Coffee Shop
          </h1>
          <p className="text-muted-foreground text-lg">
            Controle e Auditoria do Café
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <NextBuyerCard
              nextBuyer={nextBuyer}
              onRecordPurchase={recordPurchase}
              loading={loading}
            />
            
            <ParticipantsList
              participants={participants}
              onAddParticipant={addParticipant}
              onUpdateParticipant={updateParticipant}
              onReorderParticipants={reorderParticipants}
              onDeleteParticipant={deleteParticipant}
              loading={loading}
            />
          </div>

          <div>
            <PurchaseHistory 
              purchases={purchases} 
              onClearHistory={clearPurchaseHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
