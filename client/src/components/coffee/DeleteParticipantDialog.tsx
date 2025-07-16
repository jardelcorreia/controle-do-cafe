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
import { Participant } from '@/types/coffee';

interface DeleteParticipantDialogProps {
  participant: Participant;
  onDelete: (id: number) => Promise<void>;
}

export function DeleteParticipantDialog({ participant, onDelete }: DeleteParticipantDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onDelete(participant.id);
      // On success, the dialog will close via the parent component logic
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar participante');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog onOpenChange={(open) => !open && setError('')}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Deletar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Deletar Participante
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-700/80 dark:text-red-300/80">
            Tem certeza que deseja deletar permanentemente <strong>{participant.name}</strong>?
            Esta ação não pode ser desfeita.
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
              disabled={isDeleting}
              className="text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deletando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Confirmar Deleção
                </div>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
