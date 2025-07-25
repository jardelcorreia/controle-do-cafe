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
    participantsError, // Added for potential display, though not used directly here yet
    purchasesError,    // Destructure purchasesError
    nextBuyerError,    // Added for potential display
    addParticipant,
    updateParticipant,
    reorderParticipants,
    deleteParticipant,
    recordPurchase,
    clearPurchaseHistory,
    recordOutOfOrderPurchase, // Destructure the new function from useCoffeeData
    deletePurchase, // Destructure deletePurchase
  } = useCoffeeData();

  // Remove the placeholderRecordOutOfOrder function
  /*
  const placeholderRecordOutOfOrder = async (selectedId: number, currentNextId: number | null | undefined) => {
    console.log(`Placeholder: Out of order purchase for ${selectedId}, current next was ${currentNextId}`);
    return new Promise(resolve => setTimeout(resolve, 1000));
  };
  */

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
      <div className="container relative mx-auto px-4 py-8 space-y-6"> {/* Added 'relative' */}

        {/* Logout Button - Positioned Absolutely */}
        <Button
          variant="ghost"
          onClick={logout}
          aria-label="Sair"
          size="sm" // Smaller size
          className="absolute top-8 right-4 md:right-8 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100" // Positioning classes
        >
          <LogOut className="sm:mr-1 h-4 w-4" /> {/* Apply margin only on sm screens and up */}
          <span className="hidden sm:inline">Sair</span> {/* Hide text on small screens */}
        </Button>

        {/* Centered Title Group */}
        <div className="text-center mb-8"> {/* New div for centered title */}
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100">
            ☕ Coffee Shop
          </h1>
          <p className="text-muted-foreground text-lg">
            Controle e Auditoria do Café
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <NextBuyerCard
              nextBuyer={nextBuyer}
              participants={participants} // This should already be passed
              onRecordPurchase={recordPurchase}
              onRecordOutOfOrderPurchase={recordOutOfOrderPurchase} // Pass the actual function
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
              purchasesError={purchasesError} // Pass purchasesError as a prop
              onClearHistory={clearPurchaseHistory}
              deletePurchase={deletePurchase} // Pass deletePurchase
            />
          </div>
        </div>
      </div>
    </div>
  );
}
