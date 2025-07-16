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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeletePurchaseDialogProps {
  purchaseName: string;
  purchaseDate: string;
  onConfirmDelete: () => void;
}

export function DeletePurchaseDialog({
  purchaseName,
  purchaseDate,
  onConfirmDelete,
}: DeletePurchaseDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Deletar compra"
          className="h-8 w-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-red-200/30 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full shadow-md">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-700/80 dark:text-red-300/80">
            Tem certeza que deseja deletar a compra de{" "}
            <strong className="text-red-800 dark:text-red-200">{purchaseName}</strong> do dia{" "}
            <strong className="text-red-800 dark:text-red-200">{purchaseDate}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-end">
          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              className="text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={onConfirmDelete}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
