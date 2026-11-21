import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://lead_app_user:dev_secret_lead_pass_2026@localhost:5432/lead_management_dev?sslmode=disable'
  });
  await client.connect();
  
  const cat = await client.query("SELECT id, code, name FROM categories WHERE code = 'vastuwheel'");
  console.log('Category VastuWheel:', cat.rows[0]);
  
  if (cat.rows[0]) {
    const leads = await client.query('SELECT count(*) FROM leads WHERE category_id = $1', [cat.rows[0].id]);
    console.log('Leads for VastuWheel:', leads.rows[0].count);
    
    const ordersViaLeads = await client.query('SELECT count(*) FROM payment_orders po JOIN leads l ON po.lead_id = l.id WHERE l.category_id = $1', [cat.rows[0].id]);
    console.log('Payment orders for VastuWheel via leads:', ordersViaLeads.rows[0].count);

    const palmGateway = await client.query("SELECT id, name, category_id FROM gateway_accounts");
    console.table(palmGateway.rows);
  }

  await client.end();
}

verify().catch(console.error);
