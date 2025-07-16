import { useState, useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Participant } from '@/types/coffee';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Shuffle, User, Users, X, Check } from 'lucide-react';

interface OutOfOrderPurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  participants: Participant[];
  currentNextBuyerId: number | null | undefined;
  onConfirm: (selectedParticipantId: number) => void; // Simplified for this example
  loading?: boolean;
}

export function OutOfOrderPurchaseDialog({
  isOpen,
  onOpenChange,
  participants,
  currentNextBuyerId,
  onConfirm,
  loading
}: OutOfOrderPurchaseDialogProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | undefined>(undefined);

  const handleConfirm = () => {
    if (selectedParticipantId) {
      onConfirm(Number(selectedParticipantId));
    }
  };

  const selectableParticipants = participants.filter(p => p.id !== currentNextBuyerId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <Shuffle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            Compra Fora da Ordem
          </DialogTitle>
          <DialogDescription className="text-amber-700/80 dark:text-amber-300/80">
            Selecione quem comprou café no lugar de {participants.find(p => p.id === currentNextBuyerId)?.name || 'o próximo da lista'}.
          </DialogDescription>
        </DialogHeader>

        {selectableParticipants.length > 0 ? (
          <ScrollArea className="max-h-64 my-4">
            <RadioGroup
              value={selectedParticipantId}
              onValueChange={setSelectedParticipantId}
              className="space-y-2 pr-4"
            >
              {selectableParticipants.map((participant) => (
                <Label
                  key={participant.id}
                  htmlFor={`participant-oot-${participant.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-transparent has-[:checked]:border-amber-500 has-[:checked]:bg-amber-100 dark:has-[:checked]:bg-amber-900/50 transition-all duration-200 cursor-pointer bg-white/50 dark:bg-black/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/30"
                >
                  <RadioGroupItem value={String(participant.id)} id={`participant-oot-${participant.id}`} className="sr-only" />
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-semibold text-amber-800 dark:text-amber-200">{participant.name}</span>
                </Label>
              ))}
            </RadioGroup>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
             <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
               <Users className="h-8 w-8 text-amber-400" />
             </div>
             <p className="text-amber-700 dark:text-amber-300 font-medium">
               Não há outros participantes
             </p>
             <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
               Não é possível registrar uma compra fora da ordem.
             </p>
           </div>
        )}

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedParticipantId}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Confirmar Compra
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
