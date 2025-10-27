
import { FunctionDeclaration } from '@google/genai';

export const SYSTEM_INSTRUCTION = `Title: Claim Route 360 – Full-Access Virtual Adjuster Assistant

Persona & Mission
You are ClaimRoute Assistant, a precise, no-nonsense virtual assistant for field adjusters and admins using Claim Route 360. You answer questions, retrieve data, and execute actions across all modules: Claims, Scheduling/Routing, Communication, Dashboard, Report Management, Chat Settings & Templates, Storm & Loss Management, Sub-Admin Users, Tasks/Notes, Activity Log, and Analytics.

Style
Be brief, factual, and operational. Confirm before making impactful changes. When something is ambiguous, ask one targeted question or show a short disambiguation list (claimNumber, name, address, time).

Time/Units
Default timezone America/Chicago unless specified. Always show units (mi, min, hrs, km, $, %, etc.).

Core Capabilities (you MUST use the provided tools):

Claims: Create/update; read full details (claimNo, insuredName, primaryPhone, email, typeOfLoss, stormType, firmCarrier, dates, status, schedule date, address lines, city/county, state, zip, country, personal note, distance/duration, map links). Open tabs: Details, Client/Policy, Documents, Photos, Notes, Task.

Scheduling & Routing: Get schedules, reschedule, set routing goals (start time, lunch break start/end + minutes, max route duration (h/m), max stops, optimizeBy, territories), run Plan route and return saved minutes and new order.

Communication: Read/send SMS & email; initiate call; search threads by claim/name/phone.

Chat Settings: Send auto text toggle, Send reminder toggle, DND Night Range from/to; manage message templates (create/read/update/delete).

Storm Management: CRUD stormCode, stormName, address, active toggle.

Loss Management: CRUD loss types (titles such as Wind, Hail).

Sub-Admin/User Management: CRUD name, email, password, address, active toggle; quick search.

Tasks & Notes: Per-claim Task (title, description, due date) and Notes (date, type, text); list/create/update/delete.

Dashboard: Read/transition claims across lanes (No Contact, Scheduled, Inspection Started, Contacted, Completed, Cancelled); lane counts.

Report Management / Analytics: Counters (total claims, unscheduled, scheduled, completed), total expenses, charts, KPIs (drive time, inspection time, total miles by week/month/year), pending tasks card.

Activity Log: Calendar view + day panel items (type, description, time); create/update as needed.

Behavioral Rules

Use the most specific tool; do not fabricate fields. If a field is unknown, call listCustomFields (or the module’s list/read tool) and surface what exists.

Confirm before rescheduling, cancelling, completing claims, bulk moves, or changing routing goals.

If multiple records match (“Smith”), show top 3 with claimNumber, address, appointment/time.

After any write, summarize exactly what changed and impacts (e.g., route time delta).

If a tool errors, show the error plainly and propose one next step.

Confirmation Template (examples)

“Move {claimNo} – {insuredName} from {oldWindow} to {newWindow}? Estimated drive change {±minutes} min.”

“Set routing goals: start {start}, lunch {lunchStart–lunchEnd} ({minutes} min), max duration {h}h {m}m, max stops {n}, optimize {strategy}, territories {value} — confirm?”

Typical Requests (map to tools)

“Create a wind claim for Julie Richards in 77379 for Hurricane Helene.” → createClaim

“Add a follow-up task for tomorrow.” → createTask

“Turn on auto-text and set DND 20:00–08:00.” → updateChatSettings

“Set start 09:00, lunch 12:00–13:00 (30m), max duration 4h, max stops 4, optimize minimum distance; then plan route for today.” → setRoutingGoals, planRoute

“Add ‘Roof leak follow-up’ note.” → createNote

“Add storm ST2: ‘Hurricane Helene – Houston’ and set active.” → createStorm

“Add loss type ‘Hail’.” → createLossType

“Make stripe-user inactive.” → updateUser`;

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
    {
      "name": "listCustomFields",
      "description": "List all fields (standard + custom) available for a given entity/screen.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "entityType": { "type": "STRING", "description": "claim|appointment|user|storm|lossType|chatSettings|template|task|note|dashboard|report|activity|routing" },
          "screen": { "type": "STRING", "description": "Optional UI section (e.g., 'Details','Client/policy','Documents','Photos','Notes','Task','Routing:SetGoal','Communication','Report management')" },
          "entityId": { "type": "STRING", "description": "Optional ID when listing fields for a specific record" }
        },
        "required": ["entityType"]
      }
    },
    {
      "name": "createClaim",
      "description": "Create a claim with the fields visible in the Add Claims screen.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "claimNo": { "type": "STRING" },
          "policyHolder": { "type": "STRING" },
          "primaryPhone": { "type": "STRING" },
          "email": { "type": "STRING" },
          "stormType": { "type": "STRING" },
          "typeOfLoss": { "type": "STRING" },
          "firmCarrier": { "type": "STRING" },
          "lossDate": { "type": "STRING", "description": "YYYY-MM-DD" },
          "personalNote": { "type": "STRING" },
          "address": { "type": "STRING" },
          "cityOrCounty": { "type": "STRING" },
          "state": { "type": "STRING" },
          "postalCode": { "type": "STRING" },
          "country": { "type": "STRING" },
          "addressLine1": { "type": "STRING" },
          "addressLine2": { "type": "STRING" }
        },
        "required": ["claimNo", "policyHolder", "primaryPhone", "typeOfLoss"]
      }
    },
    { "name": "getClaim", "description": "Fetch claim by id.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" } }, "required": ["claimId"] } },
    { "name": "getClaimByNumber", "description": "Fetch claim by human claim number (e.g., CLM-78916).", "parameters": { "type": "OBJECT", "properties": { "claimNo": { "type": "STRING" } }, "required": ["claimNo"] } },
    {
      "name": "updateClaimFields",
      "description": "Update one or more claim fields (status, scheduleDate, notes, address, storm, loss type, etc.).",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "claimId": { "type": "STRING" },
          "changes": { "type": "ARRAY", "items": { "type": "OBJECT", "properties": { "field": { "type": "STRING" }, "newValue": { "type": "STRING" } }, "required": ["field", "newValue"] } },
          "reason": { "type": "STRING" }
        },
        "required": ["claimId", "changes"]
      }
    },
    { "name": "getSchedule", "description": "Get appointments for a date/range.", "parameters": { "type": "OBJECT", "properties": { "date": { "type": "STRING", "description": "YYYY-MM-DD" }, "endDate": { "type": "STRING", "description": "Optional YYYY-MM-DD" } }, "required": ["date"] } },
    { "name": "rescheduleAppointment", "description": "Move a claim appointment to a new time window.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "newStart": { "type": "STRING", "description": "ISO 8601" }, "newEnd": { "type": "STRING", "description": "ISO 8601" }, "reason": { "type": "STRING" } }, "required": ["claimId", "newStart", "newEnd"] } },
    { "name": "setRoutingGoals", "description": "Set routing goals visible in Routing > Set Goal screen.", "parameters": { "type": "OBJECT", "properties": { "startTime": { "type": "STRING", "description": "HH:mm" }, "lunchStart": { "type": "STRING", "description": "HH:mm" }, "lunchEnd": { "type": "STRING", "description": "HH:mm" }, "lunchMinutes": { "type": "INTEGER" }, "maxRouteHours": { "type": "INTEGER" }, "maxRouteMinutes": { "type": "INTEGER" }, "maxStops": { "type": "INTEGER" }, "optimizeBy": { "type": "STRING", "description": "Minimum distance | Mixed | etc." }, "territories": { "type": "STRING" } }, "required": ["startTime"] } },
    { "name": "planRoute", "description": "Run route optimization for a specific date using current goals.", "parameters": { "type": "OBJECT", "properties": { "date": { "type": "STRING", "description": "YYYY-MM-DD" } }, "required": ["date"] } },
    { "name": "sendMessage", "description": "Send SMS or email on a claim (free text or template).", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "channel": { "type": "STRING", "enum": ["sms", "email"] }, "templateId": { "type": "STRING" }, "text": { "type": "STRING" } }, "required": ["claimId", "channel"] } },
    { "name": "initiateCall", "description": "Place a phone call to the insured (or primary contact) and log it.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "phone": { "type": "STRING", "description": "If omitted, use primary phone on claim" } }, "required": ["claimId"] } },
    { "name": "getChatSettings", "description": "Read current chat settings (autoText, reminders, DND range, template summary).", "parameters": { "type": "OBJECT", "properties": {} } },
    { "name": "updateChatSettings", "description": "Update chat settings and DND range.", "parameters": { "type": "OBJECT", "properties": { "sendAutoText": { "type": "BOOLEAN" }, "sendReminder": { "type": "BOOLEAN" }, "dndFrom": { "type": "STRING", "description": "HH:mm" }, "dndTo": { "type": "STRING", "description": "HH:mm" } } } },
    { "name": "createTemplate", "description": "Create a chat/message template.", "parameters": { "type": "OBJECT", "properties": { "name": { "type": "STRING" }, "message": { "type": "STRING" } }, "required": ["name", "message"] } },
    { "name": "updateTemplate", "description": "Update a template’s name or message.", "parameters": { "type": "OBJECT", "properties": { "templateId": { "type": "STRING" }, "name": { "type": "STRING" }, "message": { "type": "STRING" } }, "required": ["templateId"] } },
    { "name": "deleteTemplate", "description": "Delete a template.", "parameters": { "type": "OBJECT", "properties": { "templateId": { "type": "STRING" } }, "required": ["templateId"] } },
    { "name": "createStorm", "description": "Create a storm (stormCode, name, address, active).", "parameters": { "type": "OBJECT", "properties": { "stormCode": { "type": "STRING" }, "stormName": { "type": "STRING" }, "address": { "type": "STRING" }, "active": { "type": "BOOLEAN" } }, "required": ["stormCode", "stormName"] } },
    { "name": "updateStorm", "description": "Update storm fields or toggle active.", "parameters": { "type": "OBJECT", "properties": { "stormId": { "type": "STRING" }, "changes": { "type": "ARRAY", "items": { "type": "OBJECT", "properties": { "field": { "type": "STRING" }, "newValue": { "type": "STRING" } }, "required": ["field", "newValue"] } } }, "required": ["stormId", "changes"] } },
    { "name": "createLossType", "description": "Create a loss type (title).", "parameters": { "type": "OBJECT", "properties": { "title": { "type": "STRING" } }, "required": ["title"] } },
    { "name": "deleteLossType", "description": "Delete a loss type.", "parameters": { "type": "OBJECT", "properties": { "title": { "type": "STRING" } }, "required": ["title"] } },
    { "name": "listUsers", "description": "Search/list users by name/email.", "parameters": { "type": "OBJECT", "properties": { "query": { "type": "STRING" } } } },
    { "name": "createUser", "description": "Create a sub-admin/user.", "parameters": { "type": "OBJECT", "properties": { "name": { "type": "STRING" }, "email": { "type": "STRING" }, "password": { "type": "STRING" }, "address": { "type": "STRING" }, "active": { "type": "BOOLEAN" } }, "required": ["name", "email", "password"] } },
    { "name": "updateUser", "description": "Update user fields, incl. active toggle.", "parameters": { "type": "OBJECT", "properties": { "userId": { "type": "STRING" }, "changes": { "type": "ARRAY", "items": { "type": "OBJECT", "properties": { "field": { "type": "STRING" }, "newValue": { "type": "STRING" } }, "required": ["field", "newValue"] } } }, "required": ["userId", "changes"] } },
    { "name": "listTasks", "description": "List tasks for a claim.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" } }, "required": ["claimId"] } },
    { "name": "createTask", "description": "Create a claim task.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "title": { "type": "STRING" }, "description": { "type": "STRING" }, "dueDate": { "type": "STRING", "description": "ISO 8601" } }, "required": ["claimId", "title"] } },
    { "name": "updateTask", "description": "Update a claim task.", "parameters": { "type": "OBJECT", "properties": { "taskId": { "type": "STRING" }, "changes": { "type": "ARRAY", "items": { "type": "OBJECT", "properties": { "field": { "type": "STRING" }, "newValue": { "type": "STRING" } }, "required": ["field", "newValue"] } } }, "required": ["taskId", "changes"] } },
    { "name": "createNote", "description": "Create a claim note (type, text).", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "noteType": { "type": "STRING" }, "text": { "type": "STRING" } }, "required": ["claimId", "text"] } },
    { "name": "listNotes", "description": "List notes for a claim.", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" } }, "required": ["claimId"] } },
    { "name": "getDashboard", "description": "Read dashboard lanes and cards (No Contact, Scheduled, Inspection Started, Contacted, Completed, Cancelled).", "parameters": { "type": "OBJECT", "properties": { "date": { "type": "STRING", "description": "Optional YYYY-MM-DD" } } } },
    { "name": "moveDashboardCard", "description": "Move a claim card to a different lane (status transition).", "parameters": { "type": "OBJECT", "properties": { "claimId": { "type": "STRING" }, "toLane": { "type": "STRING", "enum": ["No Contact", "Scheduled", "Inspection Started", "Contacted", "Completed", "Cancelled"] } }, "required": ["claimId", "toLane"] } },
    { "name": "getReportMetrics", "description": "Read report management counters and KPIs, optionally by period (week/month/year).", "parameters": { "type": "OBJECT", "properties": { "period": { "type": "STRING", "enum": ["week", "month", "year"] }, "month": { "type": "STRING", "description": "MMM or MM" }, "year": { "type": "STRING" } } } },
    { "name": "listActivities", "description": "List activities by date.", "parameters": { "type": "OBJECT", "properties": { "date": { "type": "STRING", "description": "YYYY-MM-DD" } }, "required": ["date"] } },
    { "name": "createActivity", "description": "Create a calendar activity (e.g., Phone Call).", "parameters": { "type": "OBJECT", "properties": { "date": { "type": "STRING", "description": "YYYY-MM-DD" }, "time": { "type": "STRING", "description": "HH:mm" }, "type": { "type": "STRING" }, "description": { "type": "STRING" } }, "required": ["date", "type"] } }
  ];
