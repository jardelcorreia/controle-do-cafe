import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, User, Shuffle, Clock, Calendar } from 'lucide-react';
import { NextBuyerResponse, Participant } from '@/types/coffee';
import { useState } from 'react';
import { OutOfOrderPurchaseDialog } from './OutOfOrderPurchaseDialog';

interface NextBuyerCardProps {
  nextBuyer: NextBuyerResponse | null;
  participants: Participant[];
  onRecordPurchase: (participantId: number) => Promise<void>;
  onRecordOutOfOrderPurchase: (selectedParticipantId: number, currentNextBuyerId: number | null | undefined) => Promise<void>;
  loading?: boolean;
}

export function NextBuyerCard({
  nextBuyer,
  participants,
  onRecordPurchase,
  onRecordOutOfOrderPurchase,
  loading
}: NextBuyerCardProps) {
  const [isOutOfOrderDialogOpen, setIsOutOfOrderDialogOpen] = useState(false);

  const handleConfirmOutOfOrderPurchase = async (selectedParticipantId: number) => {
    try {
      await onRecordOutOfOrderPurchase(selectedParticipantId, nextBuyer?.next_buyer?.id);
      setIsOutOfOrderDialogOpen(false);
    } catch (error) {
      console.error("Error recording out-of-order purchase:", error);
    }
  };

  const handleRecordPurchase = async () => {
    if (nextBuyer?.next_buyer) {
      await onRecordPurchase(nextBuyer.next_buyer.id);
    }
  };

  if (!nextBuyer) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse">
            <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-32 mb-2"></div>
            <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextBuyer.next_buyer) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-slate-600/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Coffee className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            Próximo a comprar café
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {nextBuyer.message || 'Nenhum participante encontrado'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-pulse" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 dark:bg-amber-800/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 dark:bg-orange-800/20 rounded-full translate-y-12 -translate-x-12" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
          <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-md">
            <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-lg font-semibold">Próximo a comprar café</span>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Ativo</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Next buyer info */}
        <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-1">
              {nextBuyer.next_buyer.name}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full inline-block">
              🎯 É a sua vez!
            </p>
          </div>
        </div>

        {/* Last purchase info */}
        {nextBuyer.last_purchase && (
          <div className="p-4 bg-white/30 dark:bg-black/10 rounded-xl backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Última compra</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Comprador</p>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {nextBuyer.last_purchase.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Data</p>
                <p className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(nextBuyer.last_purchase.purchase_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleRecordPurchase}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Marcar como comprado
              </div>
            )}
          </Button>

          <Button
            onClick={() => setIsOutOfOrderDialogOpen(true)}
            disabled={loading || !participants || participants.length === 0}
            variant="outline"
            size="lg"
            className="w-full border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium py-4 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Registrar Compra Fora da Ordem
          </Button>
        </div>
      </CardContent>

      <OutOfOrderPurchaseDialog
        isOpen={isOutOfOrderDialogOpen}
        onOpenChange={setIsOutOfOrderDialogOpen}
        participants={participants}
        currentNextBuyerId={nextBuyer?.next_buyer?.id}
        onConfirm={handleConfirmOutOfOrderPurchase}
        loading={loading}
      />
    </Card>
  );
}
