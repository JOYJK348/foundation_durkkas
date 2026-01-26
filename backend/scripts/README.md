# 🚀 Enterprise Intelligence Ledger (Scripts)

Unified command-driven ecosystem for DURKKAS Enterprise management, data operations, and migrations.

## 🛠️ Intelligence Toolkit (`toolkit.ts`)

The master driver for all dynamic system operations. **This tool absorbs all common administrative tasks.**

### Usage
Run using `npx ts-node toolkit.ts <command> <arguments>`

### Available Commands:
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `user` | `<id\|email>` | Comprehensive identity analysis, roles, and branch links. |
| `company` | `<id>` | Detailed entity audit, including operational metrics (staff/branches). |
| `list` | - | High-level overview of all registered enterprises and tiers. |
| `health` | - | **System Health Audit**: Verifies DB connectivity and Master Settings registry. |
| `redis` | - | **Cache Diagnostics**: Inspects active Redis session keys and cache stability. |
| `security` | - | Inspect system power-levels (roles) and permission density. |
| `provision` | `<email> [role] [compId]`| **Provision Admin Access**: Creates/Fixes admin accounts with default credentials. |
| `seed` | `[compId]` | **Populate Data**: Generates dynamic operational data for a specific company. |
| `setupStorage` | - | **Foundation Sync**: Verifies and initializes global storage bucket architecture. |

---

## 🏗️ Migration Engine (`/migrations`)
Architectural refactors and batch data migrations are isolated in the `migrations/` directory for system integrity.

- `global-menu-refactor.ts`: Synchronizes menu structures across enterprise modules.
- `migrate-crm-menus.ts`: Specialized CRM legacy menu migration logic.
- `migrate-leads.ts`: Batch operations for CRM inbound lead data.
- `sync-dipl-menus.ts`: Specific entity menu architecture synchronization.

---
**Core Policy**: No hardcoded IDs in the root toolkit. Use dynamic parameters for enterprise scalability.
