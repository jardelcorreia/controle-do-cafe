// client/src/components/coffee/OutOfOrderPurchaseDialog.tsx
import React, { useState, useId } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Participant } from '@/types/coffee';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface OutOfOrderPurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  participants: Participant[];
  currentNextBuyerId: number | null | undefined; // ID of the participant who is currently next
  onConfirm: (data: { participantId?: number; buyerName?: string; currentNextBuyerId: number | null | undefined }) => void;
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
  const [isExternalBuyer, setIsExternalBuyer] = useState(false);
  const [externalBuyerName, setExternalBuyerName] = useState('');
  const externalBuyerCheckboxId = useId();

  const handleConfirm = () => {
    if (isExternalBuyer) {
      if (externalBuyerName.trim() !== '') {
        onConfirm({ buyerName: externalBuyerName.trim(), currentNextBuyerId });
      }
    } else {
      if (selectedParticipantId) {
        onConfirm({ participantId: Number(selectedParticipantId), currentNextBuyerId });
      }
    }
  };

  const selectableParticipants = participants;

  const isConfirmButtonDisabled = loading ||
    (!isExternalBuyer && !selectedParticipantId) ||
    (isExternalBuyer && externalBuyerName.trim() === '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Compra Fora da Ordem</DialogTitle>
          <DialogDescription>
            {isExternalBuyer
              ? "Insira o nome da pessoa de fora que realizou a compra."
              : "Selecione o participante que realizou a compra do café."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id={externalBuyerCheckboxId}
            checked={isExternalBuyer}
            onCheckedChange={(checked) => setIsExternalBuyer(Boolean(checked))}
          />
          <Label htmlFor={externalBuyerCheckboxId} className="cursor-pointer">
            Registrar para pessoa de fora?
          </Label>
        </div>

        {isExternalBuyer ? (
          <div className="space-y-2 py-2">
            <Label htmlFor="externalBuyerName">Nome do Comprador</Label>
            <Input
              id="externalBuyerName"
              value={externalBuyerName}
              onChange={(e) => setExternalBuyerName(e.target.value)}
              placeholder="Ex: Visitante da Silva"
            />
          </div>
        ) : selectableParticipants.length > 0 ? (
          <ScrollArea className="max-h-[300px] pr-4">
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
            disabled={isConfirmButtonDisabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Confirmando...' : 'Confirmar Compra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
