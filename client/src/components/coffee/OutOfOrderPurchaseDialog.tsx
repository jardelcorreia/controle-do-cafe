// client/src/components/coffee/OutOfOrderPurchaseDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area'; // For potentially long lists
import { Participant } from '@/types/coffee';

interface OutOfOrderPurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  participants: Participant[];
  currentNextBuyerId: number | null | undefined; // ID of the participant who is currently next
  onConfirm: (selectedParticipantId: number) => void;
  loading?: boolean; // To disable confirm button during processing
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

  // Filter out the current next buyer from the list if they exist,
  // as the primary use case is to select someone ELSE.
  // However, if the list becomes empty as a result, it's an edge case to consider.
  // For now, let's allow selecting anyone, but it could be refined.
  const selectableParticipants = participants; // Or filter: participants.filter(p => p.id !== currentNextBuyerId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Compra Fora da Ordem</DialogTitle>
          <DialogDescription>
            Selecione o participante que realizou a compra do café.
          </DialogDescription>
        </DialogHeader>
        {selectableParticipants.length > 0 ? (
          <ScrollArea className="max-h-[300px] pr-4"> {/* Added ScrollArea */}
            <RadioGroup
              value={selectedParticipantId}
              onValueChange={setSelectedParticipantId}
              className="space-y-2 py-2"
            >
              {selectableParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RadioGroupItem value={String(participant.id)} id={`participant-${participant.id}`} />
                  <Label htmlFor={`participant-${participant.id}`} className="flex-1 cursor-pointer">
                    {participant.name}
                    {participant.id === currentNextBuyerId && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">(Próximo na ordem)</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum participante disponível para seleção.
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={!selectedParticipantId || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Confirmando...' : 'Confirmar Compra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
