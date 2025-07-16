import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Info, Save, X, UserPlus, ListOrdered } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ReorderHistoryDialog } from './ReorderHistoryDialog';
import { Participant } from '@/types/coffee';
import { ParticipantItem } from './ParticipantItem';
import { Badge } from '@/components/ui/badge';

interface ParticipantsListProps {
  participants: Participant[];
  onAddParticipant: (name: string) => Promise<void>;
  onUpdateParticipant: (id: number, name: string) => Promise<void>;
  onReorderParticipants: (participantIds: number[]) => Promise<void>;
  onDeleteParticipant: (id: number) => Promise<void>;
  loading?: boolean;
}

export function ParticipantsList({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onReorderParticipants,
  onDeleteParticipant,
}: ParticipantsListProps) {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [stagedParticipants, setStagedParticipants] = useState<Participant[]>(participants);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  useEffect(() => {
    setStagedParticipants(participants);
  }, [participants]);

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    
    setIsAdding(true);
    try {
      await onAddParticipant(newParticipantName.trim());
      setNewParticipantName('');
    } catch (error) {
      console.error('Error adding participant:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newParticipantsArray = [...stagedParticipants];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newParticipantsArray.length) {
      return;
    }

    const temp = newParticipantsArray[index];
    newParticipantsArray[index] = newParticipantsArray[targetIndex];
    newParticipantsArray[targetIndex] = temp;
    setStagedParticipants(newParticipantsArray);
  };

  const handleConfirmReorder = async () => {
    setIsConfirmingOrder(true);
    try {
      const participantIds = stagedParticipants.map(p => p.id);
      await onReorderParticipants(participantIds);
    } catch (error) {
      console.error('Error confirming reorder:', error);
    } finally {
      setIsConfirmingOrder(false);
    }
  };

  const handleCancelReorder = () => {
    setStagedParticipants(participants);
  };

  const originalOrderIds = JSON.stringify(participants.map(p => p.id));
  const stagedOrderIds = JSON.stringify(stagedParticipants.map(p => p.id));
  const hasStagedChanges = originalOrderIds !== stagedOrderIds;

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-200/10 dark:bg-orange-800/10 rounded-full translate-y-16 translate-x-16" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-semibold">Participantes</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {stagedParticipants.length} {stagedParticipants.length === 1 ? 'pessoa' : 'pessoas'}
                </Badge>
              </div>
            </div>
          </CardTitle>
          <ReorderHistoryDialog participants={participants} />
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <div className="p-4 bg-white/30 dark:bg-black/10 rounded-xl backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
          <Label htmlFor="participant-name" className="flex items-center gap-2 mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
            <UserPlus className="h-4 w-4" />
            Adicionar à lista
          </Label>
          <div className="flex gap-2">
            <Input
              id="participant-name"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nome do novo participante"
              disabled={isAdding}
              className="bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/30"
            />
            <Button 
              onClick={handleAddParticipant}
              disabled={isAdding || !newParticipantName.trim()}
              size="icon"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {stagedParticipants.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              <ListOrdered className="h-4 w-4" />
              <span>Ordem de compra (arraste para reordenar)</span>
            </div>
            <div className="space-y-2">
              {stagedParticipants.map((participant, index) => (
                <ParticipantItem
                  key={participant.id}
                  participant={participant}
                  onUpdate={onUpdateParticipant}
                  onDelete={onDeleteParticipant}
                  onMoveUp={() => handleMove(index, 'up')}
                  onMoveDown={() => handleMove(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === stagedParticipants.length - 1}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-amber-400" />
            </div>
            <p className="text-amber-700 dark:text-amber-300 font-medium">
              Nenhum participante cadastrado
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
              Adicione pessoas para começar a usar.
            </p>
          </div>
        )}

        {hasStagedChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/50">
            <Button
              variant="ghost"
              onClick={handleCancelReorder}
              disabled={isConfirmingOrder}
              className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmReorder}
              disabled={isConfirmingOrder}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isConfirmingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Ordem
                </div>
              )}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-amber-600/80 dark:text-amber-400/80 mt-4 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
          <Info className="h-3 w-3 shrink-0" />
          <span>A ordem dos participantes define quem será o próximo a comprar café.</span>
        </div>
      </CardContent>
    </Card>
  );
}
