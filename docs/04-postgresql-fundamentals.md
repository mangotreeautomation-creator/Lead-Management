# 04. PostgreSQL Fundamentals & Local Installation Guide

## 1. Relational Database Concepts: From Zero to Mastery

To build a production system, you must understand the underlying mental model of PostgreSQL. Let us break down each concept using real-world analogies.

```mermaid
graph TD
    subgraph ServerInstance["PostgreSQL Server Instance (The Entire Warehouse)"]
        subgraph DB1["Database: lead_management_dev (Vastu & Webinar Business)"]
            subgraph SchemaPublic["Schema: public (Floorplan / Department)"]
                T1["Table: business_units"]
                T2["Table: meta_campaigns"]
                T3["Table: meta_insights_daily"]
            end
            subgraph SchemaAudit["Schema: audit (Future Secure Vault)"]
                T4["Table: audit_logs"]
            end
        end
        subgraph DB2["Database: postgres (System Maintenance Database)"]
            T5["System Catalogs & Admin Tables"]
        end
    end
```

### 1. PostgreSQL Server Instance
- **What it is**: The active software process (the background service or daemon) running on a machine.
- **Analogy**: A giant physical logistics warehouse. It manages hard drive storage, memory allocation, CPU threads, and listens on a network port (default: `5432`).

### 2. Database
- **What it is**: An isolated logical container inside the server instance. Tables in one database cannot easily query tables in another database.
- **Analogy**: A completely separate commercial company operating inside the warehouse. We create `lead_management_dev` for our development work and `lead_management_test` for automated tests.

### 3. Schema
- **What it is**: A namespace inside a database that organizes tables into logical groups. By default, PostgreSQL creates and uses the `public` schema.
- **Analogy**: A specific department or filing room inside the company. You can have `public.meta_campaigns` and `analytics.meta_campaigns`.

### 4. Table
- **What it is**: A two-dimensional grid of rows and columns with strict data types.
- **Analogy**: A structured spreadsheet where every column has an unbreakable rule (e.g., column B only accepts whole numbers, column C only accepts valid dates).

### 5. Column and Row
- **Column (Attribute)**: Defines one specific property of an entity (e.g., `spend_amount`, `campaign_name`, `created_at`).
- **Row (Record / Tuple)**: One single instance of data (e.g., the record for campaign "Vastu Residential Oct 2026").

### 6. Primary Key (PK)
- **What it is**: A unique identifier for every single row in a table. It is **always unique** and **never null**.
- **Why it matters**: Without a primary key, you cannot reliably update or delete a specific record. In our architecture, we use UUIDv7 (or UUIDv4) or explicit vendor IDs (like Meta's numerical `campaign_id`).

### 7. Foreign Key (FK)
- **What it is**: A column in Table B that references the Primary Key of Table A, establishing an explicit relationship.
- **Why it matters**: **Referential Integrity**. PostgreSQL will physically block you from inserting an Ad Set referencing a Campaign ID that does not exist. It also prevents you from accidentally deleting a Business Unit if active campaigns are tied to it.

### 8. Index (B-Tree, Unique, Composite)
- **What it is**: An auxiliary data structure (typically a balanced tree) maintained by PostgreSQL on disk.
- **Analogy**: The index at the back of a 1,000-page book. Instead of scanning every single page from page 1 to 1000 (a "Full Table Scan"), the database looks up the word in the index and jumps directly to the exact page.
- **Composite Index**: An index spanning multiple columns (e.g., `[ad_account_id, date]`). Crucial for high-speed time-series analytics.

### 9. SQL (Structured Query Language)
The declarative language used to instruct PostgreSQL what data to store or retrieve:
- `SELECT`: Read data (`SELECT name, spend FROM campaigns WHERE status = 'ACTIVE'`).
- `INSERT`: Store new data (`INSERT INTO business_units (name) VALUES ('Vastu Services')`).
- `UPDATE`: Modify existing data (`UPDATE meta_campaigns SET status = 'PAUSED' WHERE id = '...'`).
- `DELETE`: Remove rows (`DELETE FROM temp_sync WHERE created_at < NOW() - INTERVAL '7 days'`).
- `UPSERT` (`INSERT ... ON CONFLICT DO UPDATE`): The secret weapon for idempotent API syncs. If the record doesn't exist, insert it; if it already exists, update its metrics.

### 10. Database User and Permissions (Least Privilege)
- **Superuser (`postgres`)**: Has absolute power to destroy databases, create users, and alter configurations. Used **only for administration**.
- **Application User (`lead_app_user`)**: A dedicated user account with restricted permissions. It can read and write data in `lead_management_dev`, but cannot drop the database or access other server configurations.

### 11. Database Connection String (URI)
The standardized format applications use to connect to PostgreSQL:
```
postgresql://lead_app_user:SecurePassword123@localhost:5432/lead_management_dev?sslmode=disable
└──┬──────┘  └─────┬───────┘ └──────┬────────┘ └───┬───┘ └─┬─┘ └────────┬────────┘ └──────┬───────┘
Protocol        Username         Password         Host    Port    Database Name       Parameters
```

### 12. Transaction (ACID)
A group of SQL operations executed as a single, indivisible unit of work:
- **Atomicity**: "All or nothing." If 4 out of 5 statements succeed and the 5th fails, the entire transaction rolls back. No half-finished orders.
- **Consistency**: The database never violates foreign keys or constraints.
- **Isolation**: Concurrent transactions cannot see each other's intermediate state.
- **Durability**: Once a transaction is committed, the data is permanently written to disk and survives power failure.

### 13. Migrations
A series of numbered, version-controlled SQL files that incrementally modify the database schema.
- **Why migrations are mandatory**: If a developer changes a table column by typing commands manually into their local database, no other developer or production server gets the change. Migrations ensure that running `npm run db:migrate` reproduces the exact same database structure everywhere.

---

## 2. Windows Installation Options: Native vs Docker

| Criteria | Native Windows PostgreSQL Installer (Recommended for this setup) | Docker-Based PostgreSQL |
| :--- | :--- | :--- |
| **Prerequisites** | None. Standard Windows installer. | Requires Docker Desktop + WSL2 (Linux subsystem) + virtualization enabled in BIOS. |
| **Current System Status** | System inspection shows Docker is **not installed**. | Would require installing Docker Desktop (~600MB installer + 4GB+ RAM overhead). |
| **Performance** | Native Windows kernel execution, maximum speed, minimal resource footprint. | Runs inside a virtualized Linux VM, higher memory and CPU usage on Windows. |
| **Management Tool** | Can include **pgAdmin 4** GUI directly in the installer. | Requires separate GUI client (DBeaver, TablePlus, or VS Code extension). |
| **Windows Service** | Automatically runs as a lightweight Windows Background Service (`postgresql-x64-16`). | Must manually launch Docker Desktop every time you boot Windows. |
| **Commercial License** | Free, open-source PostgreSQL license. | Docker Desktop requires paid subscription for commercial enterprises with >250 employees or >$10M revenue. |
| **Recommendation** | **STRONGLY RECOMMENDED**: Install native PostgreSQL 16 or 17 on Windows. Clean, fast, and immediate. | Not recommended unless the entire team is already standardized on Docker Desktop. |

---

## 3. Step-by-Step Native Windows Installation Plan

> [!NOTE] Confirmation Required Before System Software Installation
> In accordance with our production mentoring rules, we will not execute installers or alter Windows system software until you have reviewed this plan and confirmed.

### Step 1: Download the Official PostgreSQL Windows Installer
- Download PostgreSQL 16 or 17 from the official PostgreSQL global development group distributor:
  `https://www.enterprisedb.com/downloads/postgres-postgresql-downloads`
- Choose the Windows x86-64 installer.

### Step 2: Running the Installer
During the installation wizard:
1. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\16`).
2. **Components**: Select:
   - PostgreSQL Server (Required)
   - pgAdmin 4 (Recommended GUI)
   - Command Line Tools (`psql`, `pg_dump`) (Required)
3. **Data Directory**: Keep default (`C:\Program Files\PostgreSQL\16\data`).
4. **Password**: Set a secure password for the administrative `postgres` user (e.g., save it in your password manager).
5. **Port**: Keep default `5432`.
6. **Locale**: Default locale.

### Step 3: Verifying the Installation via Terminal
Once installed, the command-line tool `psql` will be available (or added to your Windows PATH):
```powershell
# Check PostgreSQL service status on Windows
Get-Service *postgres*

# Connect to postgres server as superuser
psql -U postgres -h localhost -p 5432
```

---

## 4. Setting Up Development Database & Least-Privilege User

Once PostgreSQL is running, we execute these administrative SQL commands once to create a clean, dedicated sandbox for our application:

```sql
-- 1. Create the dedicated development database
CREATE DATABASE lead_management_dev;

-- 2. Create the dedicated test database (used for automated test suites)
CREATE DATABASE lead_management_test;

-- 3. Create the dedicated application user with a strong password
CREATE USER lead_app_user WITH ENCRYPTED PASSWORD 'dev_secret_lead_pass_2026';

-- 4. Grant connection privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE lead_management_dev TO lead_app_user;
GRANT ALL PRIVILEGES ON DATABASE lead_management_test TO lead_app_user;

-- 5. Connect to the database and grant schema privileges
\c lead_management_dev
GRANT ALL ON SCHEMA public TO lead_app_user;
```

---

## 5. Connecting Node.js to PostgreSQL

In Node.js, we never open a new TCP connection for every incoming HTTP request. Opening a connection takes ~50ms of network handshake and authentication overhead.

Instead, we use a **Connection Pool** (`pg.Pool`):

```mermaid
flowchart LR
    subgraph Fastify Server
        REQ1[Request 1] --> POOL[Connection Pool: 10 pre-warmed connections]
        REQ2[Request 2] --> POOL
        REQ3[Request 3] --> POOL
    end

    subgraph PostgreSQL
        POOL <--> C1[Socket 1]
        POOL <--> C2[Socket 2]
        POOL <--> C3[Socket 3]
        C1 --> PG[(PostgreSQL Engine)]
        C2 --> PG
        C3 --> PG
    end
```

- When a request needs to query data, it checks out an available connection from the pool.
- It executes the query in ~1 millisecond.
- It immediately releases the connection back to the pool for the next request.

---

## 6. Common Connection Errors & Diagnostics

| Error Message | Root Cause | Solution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL service is not running. | Run `Start-Service postgresql*` in PowerShell. |
| `password authentication failed for user "lead_app_user"` | Incorrect password in `.env` file. | Verify `.env` `DATABASE_URL` matches password set in SQL. |
| `database "lead_management_dev" does not exist` | Database has not been created yet. | Run `CREATE DATABASE lead_management_dev;` in `psql`. |
| `permission denied for schema public` | User lacks schema privileges. | Run `GRANT ALL ON SCHEMA public TO lead_app_user;`. |

---

## 7. Safe Development Data Reset

In development, you will frequently want to reset your database to a clean slate.

### Safe Dev Reset Command (Truncation + Re-seed)
```sql
-- Safely empties all tables and restarts primary key sequences without deleting table schemas
TRUNCATE TABLE 
    meta_insights_daily, 
    meta_ads, 
    meta_ad_sets, 
    meta_campaigns, 
    meta_ad_accounts, 
    meta_business_accounts, 
    business_units 
RESTART IDENTITY CASCADE;
```

> [!CAUTION] Production Guardrails
> In production code, scripts that drop tables or run `TRUNCATE` are strictly forbidden. The application startup script checks `NODE_ENV === 'production'` and refuses to run destructive commands.
