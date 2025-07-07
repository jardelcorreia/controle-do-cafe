import express, { Router, Request, Response } from 'express'; // Importar Request, Response aqui
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import * as core from 'express-serve-static-core';
// Caminho ajustado: `../../server/database/connection`
// Isso porque `api.ts` está em `netlify/functions/api.ts`
// e `connection.ts` está em `server/database/connection.ts`.
// Com `rootDir: "."` no tsconfig.functions.json, a compilação para `netlify/functions-dist`
// manterá a estrutura:
// - netlify/functions-dist/netlify/functions/api.js
// - netlify/functions-dist/server/database/connection.js
// Portanto, a importação de api.js para connection.js será:
// `../../server/database/connection.js`
import { db } from './database/connection';

// Interface para o evento da função Netlify (simplificada)
interface NetlifyEvent {
  path: string;
  httpMethod: string;
  headers: { [key: string]: string | undefined };
  body: string | null;
  isBase64Encoded: boolean;
  queryStringParameters?: { [key: string]: string | undefined };
}

// Interface para o contexto da função Netlify (simplificada)
interface NetlifyContext {
  functionName: string;
  // ... outras propriedades do contexto
}

const createExpressApp = () => {
  // Carrega variáveis de ambiente do .env (útil para desenvolvimento local com netlify dev)
  // Mova dotenv.config() para dentro da função para garantir que seja chamado durante a inicialização da função
  dotenv.config();

  const app = express();
  const router = Router();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Interfaces para tipagem específica das rotas
  interface LoginRequestBody {
  password?: string;
}

interface DeletePurchaseParams extends core.ParamsDictionary {
  id: string;
}

interface DeletePurchaseQuery extends core.Query {
  type?: string;
}

// Login endpoint
router.post('/login', (req: Request<{}, any, LoginRequestBody>, res: Response) => {
  const { password } = req.body;
  const sharedPassword = process.env.APP_SHARED_PASSWORD;

  if (!sharedPassword) {
    console.error('APP_SHARED_PASSWORD environment variable is not set.');
    return res.status(500).json({ error: 'Login system configuration error.' });
  }

  if (password && password === sharedPassword) {
    res.json({ authenticated: true, message: 'Login successful.' });
  } else {
    res.status(401).json({ error: 'Invalid password.' });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    await db.selectFrom('participants').select('id').limit(1).execute();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', message: 'Database not ready' });
  }
});

// Get all participants
router.get('/participants', async (req: Request, res: Response) => {
  try {
    console.log('Fetching all participants');
    const participants = await db
      .selectFrom('participants')
      .selectAll()
      .orderBy('order_position', 'asc')
      .execute();

    console.log(`Found ${participants.length} participants`);
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Add new participant
router.post('/participants', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    console.log('Adding new participant:', name);

    const maxPosition = await db
      .selectFrom('participants')
      .select('order_position')
      .orderBy('order_position', 'desc')
      .executeTakeFirst();

    const newPosition = (maxPosition?.order_position || 0) + 1;

    const result = await db
      .insertInto('participants')
      .values({
        name: name.trim(),
        order_position: newPosition
      })
      .returning(['id', 'name', 'created_at', 'order_position'])
      .executeTakeFirst();

    console.log('Participant added successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding participant:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Participant with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

// Reorder participants
router.put('/participants/reorder', async (req: Request, res: Response) => {
  try {
    const { participantIds } = req.body;

    if (!Array.isArray(participantIds)) {
      res.status(400).json({ error: 'participantIds must be an array' });
      return;
    }

    console.log('Reordering participants:', participantIds);

    const oldParticipants = await db
      .selectFrom('participants')
      .select('id')
      .orderBy('order_position', 'asc')
      .execute();
    const oldOrderJson = JSON.stringify(oldParticipants.map(p => p.id));

    const updatePromises = participantIds.map((id, index) =>
      db
        .updateTable('participants')
        .set({ order_position: index + 1 })
        .where('id', '=', id)
        .execute()
    );

    await Promise.all(updatePromises);

    try {
      const newOrderJson = JSON.stringify(participantIds);
      await db
        .insertInto('reorder_history')
        .values({
          timestamp: new Date(), // Usar objeto Date diretamente
          old_order: oldOrderJson,
          new_order: newOrderJson,
        })
        .execute();
      console.log('Reorder history recorded successfully.');

      const historyIds = await db
        .selectFrom('reorder_history')
        .select('id')
        .orderBy('id', 'desc')
        .execute();

      if (historyIds.length > 2) {
        const secondNewestId = historyIds[1].id;
        await db
          .deleteFrom('reorder_history')
          .where('id', '<', secondNewestId)
          .execute();
        console.log(`Trimmed reorder history to the last 2 entries. Records older than ID ${secondNewestId} deleted.`);
      }
    } catch (historyError) {
      console.error('Failed to record reorder history:', historyError);
    }

    const participants = await db
      .selectFrom('participants')
      .selectAll()
      .orderBy('order_position', 'asc')
      .execute();

    console.log('Participants reordered successfully and history recorded');
    res.json(participants);
  } catch (error) {
    console.error('Error reordering participants:', error);
    res.status(500).json({ error: 'Failed to reorder participants' });
  }
});

// Update participant
router.put('/participants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    console.log('Updating participant:', id, 'with name:', name);

    const result = await db
      .updateTable('participants')
      .set({ name: name.trim() })
      .where('id', '=', parseInt(id))
      .returning(['id', 'name', 'created_at', 'order_position'])
      .executeTakeFirst();

    if (!result) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    console.log('Participant updated successfully:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating participant:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Participant with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

// Delete participant
router.delete('/participants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('Deleting participant:', id);

    const purchases = await db
      .selectFrom('coffee_purchases')
      .selectAll()
      .where('participant_id', '=', parseInt(id))
      .execute();

    if (purchases.length > 0) {
      res.status(400).json({
        error: 'Cannot delete participant with purchase history. Delete their purchases first.'
      });
      return;
    }

    const result = await db
      .deleteFrom('participants')
      .where('id', '=', parseInt(id))
      .returning(['id', 'name'])
      .executeTakeFirst();

    if (!result) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    console.log('Participant deleted successfully:', result);
    res.json({ message: 'Participant deleted successfully', participant: result });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: 'Failed to delete participant' });
  }
});

// Get coffee purchase history with participant names
router.get('/purchases', async (req: Request, res: Response) => {
  try {
    console.log('Fetching purchase history');

    const coffeePurchases = await db
      .selectFrom('coffee_purchases')
      .innerJoin('participants', 'participants.id', 'coffee_purchases.participant_id')
      .select([
        'coffee_purchases.id',
        'coffee_purchases.purchase_date',
        'participants.name',
        'participants.id as participant_id'
      ])
      .execute();

    const externalPurchases = await db
      .selectFrom('external_purchases')
      .select(['id', 'name', 'purchase_date'])
      .execute();

    const mappedCoffeePurchases = coffeePurchases.map(purchase => {
      // Assegurar que purchase_date seja um objeto Date e então converter para ISO string
      const purchaseDateObject = typeof purchase.purchase_date === 'string'
        ? new Date(purchase.purchase_date)
        : purchase.purchase_date;
      return {
        id: purchase.id,
        name: purchase.name,
        purchase_date: purchaseDateObject.toISOString(), // Enviar como ISO string para o cliente
        participant_id: purchase.participant_id,
        is_external: false,
      };
    });

    const mappedExternalPurchases = externalPurchases.map(purchase => {
      // Assegurar que purchase_date seja um objeto Date e então converter para ISO string
      const purchaseDateObject = typeof purchase.purchase_date === 'string'
        ? new Date(purchase.purchase_date)
        : purchase.purchase_date;
      return {
        id: purchase.id,
        name: purchase.name,
        purchase_date: purchaseDateObject.toISOString(), // Enviar como ISO string para o cliente
        is_external: true,
      };
    });

    const combinedPurchases = [...mappedCoffeePurchases, ...mappedExternalPurchases];
    combinedPurchases.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

    console.log(`Found ${combinedPurchases.length} total purchases`);
    res.json(combinedPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get reorder history
router.get('/reorder-history', async (req: Request, res: Response) => {
  try {
    console.log('Fetching reorder history');
    const history = await db
      .selectFrom('reorder_history')
      .selectAll()
      .orderBy('timestamp', 'desc')
      .execute();

    console.log(`Found ${history.length} reorder history entries`);
    res.json(history);
  } catch (error) {
    console.error('Error fetching reorder history (will return empty list):', error);
    res.json([]);
  }
});

// Record a coffee purchase
router.post('/purchases', async (req: Request, res: Response) => {
  try {
    const { participant_id, buyer_name } = req.body;
    const currentDate = new Date(); // Usar objeto Date diretamente

    if (participant_id) {
      console.log('Recording coffee purchase for participant:', participant_id);
      const result = await db
        .insertInto('coffee_purchases')
        .values({
          participant_id,
          purchase_date: currentDate, // Usar objeto Date
        })
        .returning(['id', 'participant_id', 'purchase_date'])
        .executeTakeFirst();
      console.log('Coffee purchase recorded successfully:', result);
      res.status(201).json(result);
    } else if (buyer_name) {
      console.log('Recording external purchase for buyer:', buyer_name);
      const result = await db
        .insertInto('external_purchases')
        .values({
          name: buyer_name,
          purchase_date: currentDate, // Usar objeto Date
        })
        .returning(['id', 'name', 'purchase_date'])
        .executeTakeFirst();
      console.log('External purchase recorded successfully:', result);
      res.status(201).json(result);
    } else {
      res.status(400).json({ error: 'Either participant_id or buyer_name is required' });
    }
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// Delete all purchase history
router.delete('/purchases', async (req: Request, res: Response) => {
  try {
    console.log('Deleting all purchase history (regular and external)');

    const coffeeResults = await db
      .deleteFrom('coffee_purchases')
      .execute();

    const externalResults = await db
      .deleteFrom('external_purchases')
      .execute();

    let totalDeletedRows = BigInt(0);

    if (coffeeResults && coffeeResults.length > 0 && coffeeResults[0].numDeletedRows) {
      totalDeletedRows += BigInt(coffeeResults[0].numDeletedRows);
    }
    if (externalResults && externalResults.length > 0 && externalResults[0].numDeletedRows) {
      totalDeletedRows += BigInt(externalResults[0].numDeletedRows);
    }

    console.log('All purchase history deleted successfully. Total rows affected:', totalDeletedRows);
    res.json({
      message: 'All purchase history (regular and external) deleted successfully',
      deletedCount: totalDeletedRows.toString()
    });
  } catch (error) {
    console.error('Error deleting purchase history:', error);
    res.status(500).json({ error: 'Failed to delete purchase history' });
  }
});

// Delete individual purchase
router.delete('/purchases/:id', async (req: Request<DeletePurchaseParams, any, any, DeletePurchaseQuery>, res: Response) => {
  try {
    const { id } = req.params; // req.params agora é DeletePurchaseParams
    const { type } = req.query; // req.query agora é DeletePurchaseQuery

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid purchase ID is required' });
    }
    const purchaseId = parseInt(id);

    if (type !== 'coffee' && type !== 'external') {
      return res.status(400).json({ error: 'Invalid purchase type specified. Must be "coffee" or "external".' });
    }

    console.log(`Deleting ${type} purchase with ID:`, purchaseId);

    let result;
    if (type === 'coffee') {
      result = await db
        .deleteFrom('coffee_purchases')
        .where('id', '=', purchaseId)
        .executeTakeFirst();
    } else { // type === 'external'
      result = await db
        .deleteFrom('external_purchases')
        .where('id', '=', purchaseId)
        .executeTakeFirst();
    }

    if (result && result.numDeletedRows > 0) {
      console.log(`${type} purchase ${purchaseId} deleted successfully.`);
      res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} purchase deleted successfully` });
    } else {
      console.log(`${type} purchase ${purchaseId} not found or already deleted.`);
      res.status(404).json({ error: `${type.charAt(0).toUpperCase() + type.slice(1)} purchase not found` });
    }
  } catch (error) {
    console.error('Error deleting individual purchase:', error);
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

// Get next person to buy coffee
router.get('/next-buyer', async (req: Request, res: Response) => {
  try {
    console.log('Calculating next coffee buyer');

    const participants = await db
      .selectFrom('participants')
      .selectAll()
      .orderBy('order_position', 'asc')
      .execute();

    if (participants.length === 0) {
      res.json({ next_buyer: null, message: 'No participants found' });
      return;
    }

    const lastPurchase = await db
      .selectFrom('coffee_purchases')
      .innerJoin('participants', 'participants.id', 'coffee_purchases.participant_id')
      .select([
        'participants.id as participant_id',
        'participants.name',
        'coffee_purchases.purchase_date'
      ])
      .orderBy('coffee_purchases.purchase_date', 'desc')
      .executeTakeFirst();

    let nextBuyer;

    if (!lastPurchase) {
      nextBuyer = participants[0];
      console.log('No previous purchases, suggesting first participant:', nextBuyer.name);
    } else {
      const currentIndex = participants.findIndex(p => p.id === lastPurchase.participant_id);
      const nextIndex = (currentIndex + 1) % participants.length;
      nextBuyer = participants[nextIndex];

      console.log(`Last buyer: ${lastPurchase.name}, Next buyer: ${nextBuyer.name}`);
    }

    res.json({
      next_buyer: nextBuyer,
      last_purchase: lastPurchase || null
    });
  } catch (error) {
    console.error('Error calculating next buyer:', error);
    res.status(500).json({ error: 'Failed to calculate next buyer' });
  }
});

      // ... (demais rotas)

      app.use(router); // Montar o router diretamente
      return app; // Retornar a instância do app Express
    };

    // Handler principal da função Netlify
    const serverlessHandler = serverless(createExpressApp());

    export const handler = async (event: NetlifyEvent, context: NetlifyContext) => {
      console.log("--- RAW NETLIFY EVENT ---");
      console.log(JSON.stringify(event, null, 2));
      console.log("--- NETLIFY CONTEXT ---");
      console.log(JSON.stringify(context, null, 2));

      // Adicionar log para o path que o serverless-http provavelmente usará
      if (event.requestContext && event.requestContext.http && event.requestContext.http.path) {
        console.log("Path for serverless-http (from event.requestContext.http.path):", event.requestContext.http.path);
      } else {
        console.log("Path for serverless-http (from event.path):", event.path);
      }

      return serverlessHandler(event, context);
    };
