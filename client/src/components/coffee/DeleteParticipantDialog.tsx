import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Participant } from '@/types/coffee';

interface DeleteParticipantDialogProps {
  participant: Participant;
  onDelete: (id: number) => Promise<void>;
}

export function DeleteParticipantDialog({ participant, onDelete }: DeleteParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await onDelete(participant.id);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar participante');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deletar Participante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja deletar <strong>{participant.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. O participante só pode ser deletado se não tiver histórico de compras.
          </p>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
