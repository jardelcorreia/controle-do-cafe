import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, User, Shuffle } from 'lucide-react';
import { NextBuyerResponse, Participant } from '@/types/coffee';
import { useState } from 'react'; // Added useState
import { OutOfOrderPurchaseDialog } from './OutOfOrderPurchaseDialog'; // Added import

interface NextBuyerCardProps {
  nextBuyer: NextBuyerResponse | null;
  participants: Participant[];
  onRecordPurchase: (participantId: number) => Promise<void>;
  onRecordOutOfOrderPurchase: (selectedParticipantId: number, currentNextBuyerId: number | null | undefined) => Promise<void>; // Add this
  loading?: boolean;
}

export function NextBuyerCard({ nextBuyer, participants, onRecordPurchase, onRecordOutOfOrderPurchase, loading }: NextBuyerCardProps) { // Add participants and new prop
  const [isOutOfOrderDialogOpen, setIsOutOfOrderDialogOpen] = useState(false); // Added state

  // New handler function in NextBuyerCard
  const handleConfirmOutOfOrderPurchase = async (selectedParticipantId: number) => {
    // setIsProcessingOutOfOrder(true); // For specific loading state if desired
    try {
      await onRecordOutOfOrderPurchase(selectedParticipantId, nextBuyer?.next_buyer?.id);
      setIsOutOfOrderDialogOpen(false);
    } catch (error) {
      console.error("Error recording out-of-order purchase:", error);
      // Potentially show error to user
    } finally {
      // setIsProcessingOutOfOrder(false);
    }
  };

  const handleRecordPurchase = async () => {
    if (nextBuyer?.next_buyer) {
      await onRecordPurchase(nextBuyer.next_buyer.id);
    }
  };

  if (!nextBuyer) {
    return (
      <Card className="card-coffee-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Coffee className="h-5 w-5" />
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!nextBuyer.next_buyer) {
    return (
      <Card className="card-coffee-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Coffee className="h-5 w-5" />
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {nextBuyer.message || 'Nenhum participante encontrado'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Coffee className="h-5 w-5" />
          Próximo a comprar café
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
            <User className="h-6 w-6 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {nextBuyer.next_buyer.name}
            </p>
            <p className="text-sm text-muted-foreground">
              É a sua vez!
            </p>
          </div>
        </div>

        {nextBuyer.last_purchase && (
          <div className="text-sm text-muted-foreground">
            <p>
              Última compra: <strong>{nextBuyer.last_purchase.name}</strong>
            </p>
            <p>
              {new Date(nextBuyer.last_purchase.purchase_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <Button 
          onClick={handleRecordPurchase}
          disabled={loading}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white"
        >
          {loading ? 'Registrando...' : 'Marcar como comprado'}
        </Button>
        {/* Add new button here */}
        <Button
          onClick={() => setIsOutOfOrderDialogOpen(true)} // Updated onClick
          disabled={loading || !participants || participants.length === 0}
          variant="outline"
          className="w-full mt-2"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          Registrar Compra Fora da Ordem
        </Button>
      </CardContent>
      <OutOfOrderPurchaseDialog
        isOpen={isOutOfOrderDialogOpen}
        onOpenChange={setIsOutOfOrderDialogOpen}
        participants={participants}
        currentNextBuyerId={nextBuyer?.next_buyer?.id}
        onConfirm={handleConfirmOutOfOrderPurchase}
        loading={loading} // Can be a more specific loading state if needed
      />
    </Card>
  );
}
