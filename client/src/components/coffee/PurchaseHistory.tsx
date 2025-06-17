import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History } from 'lucide-react';
import { Purchase } from '@/types/coffee';
import { ClearHistoryDialog } from './ClearHistoryDialog';

interface PurchaseHistoryProps {
  purchases: Purchase[];
  onClearHistory: () => Promise<void>;
  purchasesError?: string | null; // Added purchasesError prop
}

export function PurchaseHistory({ purchases, onClearHistory, purchasesError }: PurchaseHistoryProps) {
  const hasPurchases = Array.isArray(purchases) && purchases.length > 0;
  const showError = !!purchasesError;

  return (
    <Card className="card-coffee-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <History className="h-5 w-5" />
            Histórico de compras
          </CardTitle>
          {/* Show button only if there are purchases and no error */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
            {purchases.map((purchase) => {
              const date = new Date(purchase.purchase_date); // Converts UTC to local time
              return (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.name}</TableCell>
                  <TableCell>{date.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          </Table>
        ) : (
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
