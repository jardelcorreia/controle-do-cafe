import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ClearHistoryDialogProps {
  onClearHistory: () => Promise<void>;
  purchaseCount: number;
}

export function ClearHistoryDialog({ onClearHistory, purchaseCount }: ClearHistoryDialogProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState('');

  const handleClear = async () => {
    setIsClearing(true);
    setError('');
    try {
      await onClearHistory();
      // On success, the dialog will close automatically if using AlertDialogAction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar histórico');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AlertDialog onOpenChange={(open) => !open && setError('')}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={purchaseCount === 0}
          className="border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 font-medium transition-all duration-200 hover:shadow-md"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Histórico
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Limpar Histórico de Compras
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-700/80 dark:text-red-300/80 space-y-2">
            <p>
              Tem certeza que deseja limpar todo o histórico de compras?
              Esta ação irá deletar permanentemente <strong className="text-red-800 dark:text-red-200">{purchaseCount}</strong> registro(s) e não pode ser desfeita.
            </p>
            <p>
              O próximo comprador será resetado para o primeiro participante da lista.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:justify-end">
          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              disabled={isClearing}
              className="text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleClear}
              disabled={isClearing}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isClearing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Limpando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Confirmar Limpeza
                </div>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
