import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database/connection.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all participants
app.get('/api/participants', async (req, res) => {
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
app.post('/api/participants', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    console.log('Adding new participant:', name);
    
    // Get the highest order_position and add 1
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
app.put('/api/participants/reorder', async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    if (!Array.isArray(participantIds)) {
      res.status(400).json({ error: 'participantIds must be an array' });
      return;
    }

    console.log('Reordering participants:', participantIds);

    // Fetch current order before updating
    const oldParticipants = await db
      .selectFrom('participants')
      .select('id')
      .orderBy('order_position', 'asc')
      .execute();
    const oldOrderJson = JSON.stringify(oldParticipants.map(p => p.id));
    
    // Update order positions for all participants
    const updatePromises = participantIds.map((id, index) =>
      db
        .updateTable('participants')
        .set({ order_position: index + 1 })
        .where('id', '=', id)
        .execute()
    );
    
    await Promise.all(updatePromises);

    try {
      // Record the reorder history
      const newOrderJson = JSON.stringify(participantIds);
      await db
        .insertInto('reorder_history')
        .values({
          timestamp: new Date().toISOString(),
          old_order: oldOrderJson,
          new_order: newOrderJson,
        })
        .execute();
      console.log('Reorder history recorded successfully.');

      // Trim history to last 2 entries
      const historyIds = await db
        .selectFrom('reorder_history')
        .select('id')
        .orderBy('id', 'desc') // Order by ID descending to get newest first
        .execute();

      if (historyIds.length > 2) {
        // Get the ID of the second newest record.
        // Since they are ordered by id DESC, the second newest is at index 1.
        const secondNewestId = historyIds[1].id;

        // Delete records older than the second newest (i.e., all records with ID < secondNewestId)
        await db
          .deleteFrom('reorder_history')
          .where('id', '<', secondNewestId)
          .execute();
        console.log(`Trimmed reorder history to the last 2 entries. Records older than ID ${secondNewestId} deleted.`);
      }
    } catch (historyError) {
      console.error('Failed to record reorder history:', historyError);
      // Optionally, you could inform the client that history recording failed,
      // but for now, just logging on the server is fine to keep reordering functional.
    }
    
    // Fetch updated participants
    const participants = await db
      .selectFrom('participants')
      .selectAll()
      .orderBy('order_position', 'asc')
      .execute();
    
    console.log('Participants reordered successfully and history recorded');
    res.json(participants);
  } catch (error) {
    console.error('Error reordering participants:', error);
    // It's good practice to also log the specific error if possible, e.g. error.message
    res.status(500).json({ error: 'Failed to reorder participants' });
  }
});

// Update participant
app.put('/api/participants/:id', async (req, res) => {
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
app.delete('/api/participants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting participant:', id);
    
    // Check if participant has any purchases
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
app.get('/api/purchases', async (req, res) => {
  try {
    console.log('Fetching purchase history');
    const purchases = await db
      .selectFrom('coffee_purchases')
      .innerJoin('participants', 'participants.id', 'coffee_purchases.participant_id')
      .select([
        'coffee_purchases.id',
        'coffee_purchases.purchase_date',
        'participants.name',
        'participants.id as participant_id'
      ])
      .orderBy('coffee_purchases.purchase_date', 'desc')
      .execute();
    
    console.log(`Found ${purchases.length} purchases`);
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get reorder history
app.get('/api/reorder-history', async (req, res) => {
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
    // Return an empty list if there's an error (e.g., table not found)
    // The client will show "No history found" which is acceptable in this case.
    res.json([]);
  }
});

// Record a coffee purchase
app.post('/api/purchases', async (req, res) => {
  try {
    const { participant_id } = req.body;
    
    if (!participant_id) {
      res.status(400).json({ error: 'Participant ID is required' });
      return;
    }

    console.log('Recording coffee purchase for participant:', participant_id);
    
    const result = await db
      .insertInto('coffee_purchases')
      .values({ participant_id })
      .returning(['id', 'participant_id', 'purchase_date'])
      .executeTakeFirst();
    
    console.log('Purchase recorded successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ error: 'Failed to record purchase' });
  }
});

// Delete all purchase history
app.delete('/api/purchases', async (req, res) => {
  try {
    console.log('Deleting all purchase history');
    
    const results = await db
      .deleteFrom('coffee_purchases')
      .execute();
    
    const numDeleted = results && results.length > 0 && results[0].numDeletedRows ? BigInt(results[0].numDeletedRows) : BigInt(0);

    console.log('Purchase history deleted successfully. Rows affected:', numDeleted);
    res.json({ 
      message: 'Purchase history deleted successfully', 
      deletedCount: numDeleted.toString()
    });
  } catch (error) {
    console.error('Error deleting purchase history:', error);
    res.status(500).json({ error: 'Failed to delete purchase history' });
  }
});

// Get next person to buy coffee
app.get('/api/next-buyer', async (req, res) => {
  try {
    console.log('Calculating next coffee buyer');
    
    // Get all participants in order
    const participants = await db
      .selectFrom('participants')
      .selectAll()
      .orderBy('order_position', 'asc')
      .execute();
    
    if (participants.length === 0) {
      res.json({ next_buyer: null, message: 'No participants found' });
      return;
    }
    
    // Get last purchase
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
      // No purchases yet, return first participant
      nextBuyer = participants[0];
      console.log('No previous purchases, suggesting first participant:', nextBuyer.name);
    } else {
      // Find current participant index
      const currentIndex = participants.findIndex(p => p.id === lastPurchase.participant_id);
      // Get next participant (circular)
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

export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
