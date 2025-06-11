import { useCoffeeData } from '@/hooks/useCoffeeData';
import { NextBuyerCard } from './NextBuyerCard';
import { ParticipantsList } from './ParticipantsList';
import { PurchaseHistory } from './PurchaseHistory';
import { useAuth } from '@/contexts/AuthContext'; // Added
import { Button } from '@/components/ui/button'; // Added
import { LogOut } from 'lucide-react'; // Added

export function CoffeeSystem() {
  const { logout } = useAuth(); // Added
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
        <div className="flex justify-between items-center mb-6"> {/* Changed from text-center and added mb-6 */}
          <div> {/* Added div to keep title and subtitle together */}
            <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100">
              ☕ Coffee Shop
            </h1>
            <p className="text-muted-foreground text-lg">
              Controle e Auditoria do Café
            </p>
          </div>
          <Button variant="ghost" onClick={logout} aria-label="Sair" className="text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100">
            <LogOut className="mr-2 h-5 w-5" /> Sair
          </Button>
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
