import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, User, X, Check } from 'lucide-react';
import { Participant } from '@/types/coffee';

interface EditParticipantDialogProps {
  participant: Participant;
  onUpdate: (id: number, name: string) => Promise<void>;
}

export function EditParticipantDialog({ participant, onUpdate }: EditParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(participant.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome não pode estar vazio.');
      return;
    }

    setIsUpdating(true);
    setError('');
    
    try {
      await onUpdate(participant.id, name.trim());
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar participante');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setName(participant.name);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <Edit className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            Editar Participante
          </DialogTitle>
          <DialogDescription className="text-amber-700/80 dark:text-amber-300/80">
            Altere o nome do participante. A mudança será refletida em todo o sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="relative">
            <Label htmlFor="edit-name" className="sr-only">Nome</Label>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do participante"
              disabled={isUpdating}
              className="pl-10 bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/30 border-amber-200/50 dark:border-amber-800/50"
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          )}
          
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
              className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !name.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Salvar Alterações
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
