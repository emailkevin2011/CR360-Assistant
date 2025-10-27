import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are Atlas, an AI assistant for ClaimRoute 360, a claims management platform.
You can help users manage claims, schedules, and reports.
When asked to perform an action, use the available tools.
When asked about claims, you can search for claims, get claim details, and update claim statuses.
You can also manage the user's calendar by listing and creating activities.
For reporting, you can fetch dashboard metrics and report KPIs.
Be concise and helpful.`;

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "searchClaims",
    description: "Search for claims by claim ID, policy number, or claimant name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING }
      },
      required: ["query"]
    }
  },
  {
    name: "getClaimDetails",
    description: "Get detailed information about a specific claim.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        claimId: { type: Type.STRING }
      },
      required: ["claimId"]
    }
  },
  {
    name: "getDashboard",
    description: "Read dashboard lanes and cards (No Contact, Scheduled, Inspection Started, Contacted, Completed, Cancelled).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Optional YYYY-MM-DD" }
      }
    }
  },
  {
    name: "moveDashboardCard",
    description: "Move a claim card to a different lane (status transition).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        claimId: { type: Type.STRING },
        toLane: { type: Type.STRING, enum: ["No Contact", "Scheduled", "Inspection Started", "Contacted", "Completed", "Cancelled"] }
      },
      required: ["claimId", "toLane"]
    }
  },
  {
    name: "getReportMetrics",
    description: "Read report management counters and KPIs, optionally by period (week/month/year/quarter). Can fetch specific metrics like drive time, inspection time, average inspection time, total miles, a summary of claim statuses, count logged calls, find the most active day of last month, find the day with the highest mileage, calculate the percentage of rescheduled claims last month, find which storm caused the most claims, or a full performance summary for the quarter.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, enum: ["week", "month", "year", "quarter"] },
        month: { type: Type.STRING, description: "MMM or MM" },
        year: { type: Type.STRING },
        metrics: {
          type: Type.ARRAY,
          description: "A list of specific KPIs to retrieve.",
          items: { type: Type.STRING, enum: ["driveTime", "inspectionTime", "averageInspectionTime", "totalMiles", "completedClaims", "claimStatusSummary", "loggedCallsCount", "mostActiveDayLastMonth", "highestMileageDay", "rescheduledClaimsPercentageLastMonth", "mostClaimsByStorm", "quarterlyPerformanceSummary"] }
        }
      }
    }
  },
  {
    name: "listActivities",
    description: "List activities by date.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "YYYY-MM-DD" }
      },
      required: ["date"]
    }
  },
  {
    name: "createActivity",
    description: "Create a calendar activity (e.g., Phone Call).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "YYYY-MM-DD" },
        time: { type: Type.STRING, description: "HH:mm" },
        type: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["date", "type"]
    }
  },
  {
    name: "getRoutingGoals",
    description: "Gets the current routing goals.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "findClaimByName",
    description: "Finds a claim by the insured's name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        insuredName: { type: Type.STRING }
      },
      required: ["insuredName"]
    }
  },
  {
    name: "searchMessages",
    description: "Search for messages by policyholder name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING }
      },
      required: ["query"]
    }
  },
  {
    name: "getUnreadMessages",
    description: "Get all unread messages for the current user.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "listStorms",
    description: "List all storms, with an option to filter for active storms.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        active: { type: Type.BOOLEAN }
      }
    }
  },
  {
    name: "listLossTypes",
    description: "List all available loss types.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "searchTasks",
    description: "Search for tasks based on their due date status.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["overdue", "due_today"] }
      },
      required: ["status"]
    }
  }
];