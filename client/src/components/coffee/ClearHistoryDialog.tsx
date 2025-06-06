import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ClearHistoryDialogProps {
  onClearHistory: () => Promise<void>;
  purchaseCount: number;
}

export function ClearHistoryDialog({ onClearHistory, purchaseCount }: ClearHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState('');

  const handleClearHistory = async () => {
    setIsClearing(true);
    setError('');
    
    try {
      await onClearHistory();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar histórico');
    } finally {
      setIsClearing(false);
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
        <Button 
          variant="outline" 
          size="sm"
          disabled={purchaseCount === 0}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar histórico
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limpar Histórico de Compras</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja limpar todo o histórico de compras?
          </p>
          <p className="text-sm text-muted-foreground">
            Esta ação irá deletar permanentemente <strong>{purchaseCount}</strong> registro(s) 
            de compras e não pode ser desfeita.
          </p>
          <p className="text-sm text-muted-foreground">
            O próximo comprador será resetado para o primeiro participante da lista.
          </p>
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isClearing}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClearHistory}
              disabled={isClearing}
            >
              {isClearing ? 'Limpando...' : 'Limpar histórico'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
