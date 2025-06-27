import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Trash2 } from 'lucide-react'; // Added Trash2 for direct use if needed, though dialog handles it
import { Purchase } from '@/types/coffee';
import { ClearHistoryDialog } from './ClearHistoryDialog';
import { DeletePurchaseDialog } from './DeletePurchaseDialog'; // Import the new dialog
import { Button } from '@/components/ui/button'; // For the delete button if used directly

interface PurchaseHistoryProps {
  purchases: Purchase[];
  onClearHistory: () => Promise<void>;
  deletePurchase: (purchaseId: number, isExternal: boolean) => Promise<void>; // Add deletePurchase prop
  purchasesError?: string | null;
}

export function PurchaseHistory({
  purchases,
  onClearHistory,
  deletePurchase, // Destructure deletePurchase
  purchasesError,
}: PurchaseHistoryProps) {
  const hasPurchases = Array.isArray(purchases) && purchases.length > 0;
  const showError = !!purchasesError;

  const handleDelete = async (purchaseId: number, isExternal: boolean) => {
    try {
      await deletePurchase(purchaseId, isExternal);
      // Optionally, add a success toast/notification here
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      // Optionally, add an error toast/notification here
    }
  };

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <History className="h-5 w-5" />
            Histórico de compras
          </CardTitle>
          {hasPurchases && !showError && (
            <ClearHistoryDialog
              onClearHistory={onClearHistory}
              purchaseCount={purchases.length}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showError ? (
          <p className="text-red-500 text-center py-4">
            Erro ao carregar o histórico de compras: {purchasesError}
          </p>
        ) : !hasPurchases ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma compra registrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead className="text-right">Ações</TableHead> {/* New Actions Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const date = new Date(purchase.purchase_date);
                const formattedDate = date.toLocaleDateString('pt-BR');
                const formattedTime = date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <TableRow key={`${purchase.id}-${purchase.is_external}`}> {/* Ensure unique key if IDs could overlap */}
                    <TableCell>{purchase.name}</TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell className="text-right">
                      <DeletePurchaseDialog
                        purchaseName={purchase.name}
                        purchaseDate={`${formattedDate} às ${formattedTime}`}
                        onConfirmDelete={() => handleDelete(purchase.id, purchase.is_external)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}