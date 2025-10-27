import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are Atlys, a world-class AI assistant for insurance adjusters using the ClaimRoute 360 platform. 
Your purpose is to provide immediate, accurate, and helpful responses by leveraging the available tools.
You can manage the entire lifecycle of claims, schedules, communications, storms, loss types, users, tasks, notes, and dashboard workflows.
You can also provide deep analytics and reports on all aspects of the business.
You are proactive, concise, and professional. You must always use the available tools to answer questions and perform actions. Do not invent data.
When a user refers to a claim, they will often use the insured's name or property address instead of a claim number; your tools are designed to look up claims using any of these identifiers. If a name is ambiguous and multiple claims are found, ask the user for clarification.
If a user asks what you can do, summarize your capabilities based on the tool names.
If asked about a concept (e.g., "What does 'Inspection Started' mean?"), provide a logical explanation based on your understanding of the insurance adjustment workflow.
Today's date is ${new Date().toLocaleDateString('en-CA')}.`;

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
    // 1. Claims Management (Create, Read, Update)
    {
        name: "manageClaim",
        description: "Manages claims. Can create, get details for, and update a claim. For searching multiple claims, use 'searchClaims'. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['create', 'getDetails', 'update'] },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured policyholder. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address for the claim. Use if claimId is unknown." },
                updates: {
                    type: Type.OBJECT,
                    description: "Object containing all fields for creating or updating a claim.",
                    properties: {
                        policyholderName: { type: Type.STRING },
                        lossType: { type: Type.STRING },
                        address: { type: Type.STRING, description: "Full address, e.g., '123 Oak St, Austin TX 78701'" },
                        carrier: { type: Type.STRING },
                        lossDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format." },
                        status: { type: Type.STRING, description: "The workflow status of the claim, e.g., 'Scheduled', 'Completed'." },
                        stormName: { type: Type.STRING },
                        policyNumber: { type: Type.STRING },
                        phoneNumber: { type: Type.STRING },
                        secondaryContact: { type: Type.STRING },
                        assignedUser: { type: Type.STRING }
                    }
                }
            },
            required: ["action"]
        }
    },
    // 2. Claims Management (Search)
    {
        name: "searchClaims",
        description: "Searches for claims based on a wide variety of criteria.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, description: "e.g., 'Open', 'Scheduled'" },
                lossType: { type: Type.STRING },
                city: { type: Type.STRING },
                carrier: { type: Type.STRING },
                createdAfter: { type: Type.STRING, description: "YYYY-MM-DD" },
                hasPhotos: { type: Type.BOOLEAN },
                lastNamePrefix: { type: Type.STRING },
                zipCodeStart: { type: Type.STRING },
                zipCodeEnd: { type: Type.STRING },
                isMissingPhoneNumber: {type: Type.BOOLEAN},
                isUnscheduled: {type: Type.BOOLEAN},
                stormName: { type: Type.STRING }
            }
        }
    },
    // 3. Scheduling & Routing
    {
        name: "manageSchedule",
        description: "Manages the user's schedule. Can get, reschedule, cancel, or analyze appointments. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: [
                    'get', 'rescheduleClaim', 'shiftAppointments', 'cancelAppointments', 
                    'scheduleNewClaim', 'calculateIdleTime', 'findOverlappingAppointments', 
                    'rescheduleToEarliestAvailable', 'findOpenTimeSlots', 'scheduleBreak',
                    'rebookClaimsByStatus'
                ]},
                // Common args
                date: { type: Type.STRING, description: "YYYY-MM-DD or relative: 'today', 'tomorrow', 'Friday'" },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                // Action-specific args
                newTime: { type: Type.STRING, description: "HH:mm" },
                timeBlock: { type: Type.STRING, enum: ["afternoon", "morning"] },
                shiftMinutes: { type: Type.NUMBER },
                startTime: { type: Type.STRING, description: "HH:mm" },
                endTime: { type: Type.STRING, description: "HH:mm" },
                claimantName: { type: Type.STRING },
                timeOfDay: { type: Type.STRING, enum: ["morning", "afternoon"] },
                durationMinutes: { type: Type.NUMBER },
                claimStatusToRebook: { type: Type.STRING }
            },
            required: ["action"]
        }
    },
    // 4. Routing
    {
        name: "manageRouting",
        description: "Manages route optimization and goals.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['getGoals', 'setGoals', 'optimize', 'getMetrics', 'findFurthestClaim'] },
                goals: {
                    type: Type.OBJECT,
                    properties: {
                        startTime: { type: Type.STRING, description: "HH:mm" },
                        lunchTime: { type: Type.STRING, description: "Start and end time, e.g., '12:00-12:45'" },
                        maxStops: { type: Type.NUMBER },
                        optimizationType: { type: Type.STRING, enum: ["minimumDistance", "maximumStops"] },
                        bufferMinutes: { type: Type.NUMBER }
                    }
                },
                optimizationStrategy: { type: Type.STRING, enum: ["minimumDistance", "mixedPriority", "fastestTime"] },
                metric: { type: Type.STRING, enum: ["totalDistance", "totalDuration", "compareMinutesSavedTodayVsYesterday"] },
                date: { type: Type.STRING, description: "YYYY-MM-DD or relative term 'today'."}
            },
            required: ["action"]
        }
    },
    // 5. Communication
    {
        name: "manageCommunication",
        description: "Handles all communication: sending messages/emails, searching history, and managing templates and settings. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['send', 'search', 'manageTemplate', 'manageSettings', 'bulkSendReminders'] },
                // Send args
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                message: { type: Type.STRING },
                subject: { type: Type.STRING },
                templateName: { type: Type.STRING },
                // Search args
                searchPeriod: { type: Type.STRING, enum: ["today"] },
                searchPolicyholderName: { type: Type.STRING },
                isUnread: { type: Type.BOOLEAN },
                getMostRecent: { type: Type.BOOLEAN },
                limit: { type: Type.NUMBER },
                // Template args
                templateAction: { type: Type.STRING, enum: ['create', 'update', 'delete', 'list'] },
                templateContent: { type: Type.STRING },
                // Settings args
                settingsAction: { type: Type.STRING, enum: ['get', 'set'] },
                settings: { type: Type.OBJECT, properties: { autoTextsEnabled: { type: Type.BOOLEAN }, remindersEnabled: { type: Type.BOOLEAN }, dndRange: { type: Type.STRING } } },
                // Bulk Send Args
                dateForReminders: { type: Type.STRING, description: "YYYY-MM-DD or 'tomorrow'" }
            },
            required: ["action"]
        }
    },
    // 6. Storms
    {
        name: "manageStorms",
        description: "Manages storm events: create, update, delete, list, and assign storms to claims.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['create', 'update', 'delete', 'list', 'assignToLocation'] },
                stormId: { type: Type.STRING },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        location: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["active", "inactive"] }
                    }
                },
                locationFilter: { type: Type.STRING },
                statusFilter: { type: Type.STRING, enum: ["active", "inactive"] }
            },
            required: ["action"]
        }
    },
    // 7. Loss Types
    {
        name: "manageLossTypes",
        description: "Manages loss types: create, update, delete, and list.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['create', 'update', 'delete', 'list'] },
                name: { type: Type.STRING, description: "The name of the new loss type for 'create', or the name to delete for 'delete'."},
                oldName: { type: Type.STRING, description: "The current name of the loss type to update."},
                newName: { type: Type.STRING, description: "The new name for the loss type."}
            },
            required: ["action"]
        }
    },
    // 8. Users
    {
        name: "manageUser",
        description: "Manages users: create, update, delete, list, and reset passwords.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['create', 'update', 'delete', 'list', 'resetPassword'] },
                name: { type: Type.STRING },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        email: { type: Type.STRING },
                        password: { type: Type.STRING },
                        role: { type: Type.STRING, enum: ["sub-admin", "adjuster"] },
                        address: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["active", "inactive"] }
                    }
                },
                filters: {
                    type: Type.OBJECT,
                    properties: {
                        role: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ["active", "inactive"] },
                        createdThisMonth: { type: Type.BOOLEAN }
                    }
                }
            },
            required: ["action"]
        }
    },
    // 9. Tasks
    {
        name: "manageTasks",
        description: "Manages tasks for claims: create, update, list, delete, and search. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['create', 'update', 'list', 'delete', 'searchByKeyword', 'bulkCreateForSchedule'] },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                taskId: { type: Type.STRING },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        dueDate: { type: Type.STRING, description: "YYYY-MM-DD, 'today', or 'tomorrow'." },
                        dueTime: { type: Type.STRING, description: "HH:mm" },
                        status: { type: Type.STRING, enum: ["completed", "open"] }
                    }
                },
                keyword: { type: Type.STRING },
                date: { type: Type.STRING, description: "YYYY-MM-DD or 'tomorrow' for bulk creation." },
                taskIdentifier: { type: Type.STRING, enum: ["most recent"] }
            },
            required: ["action"]
        }
    },
    // 10. Notes
    {
        name: "manageNotes",
        description: "Manages notes for claims: add, update, list, and delete. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['add', 'update', 'list', 'delete'] },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                noteId: { type: Type.STRING },
                content: { type: Type.STRING }
            },
            required: ["action"]
        }
    },
    // 11. Dashboard
    {
        name: "manageDashboard",
        description: "Manages the claims dashboard: get the full view, list claims in a specific lane, and move claims between lanes. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                action: { type: Type.STRING, enum: ['get', 'moveClaim', 'bulkMoveLanes', 'getLaneContents'] },
                stormNameFilter: { type: Type.STRING },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                targetLane: { type: Type.STRING },
                sourceLane: { type: Type.STRING },
                laneName: { type: Type.STRING, description: "The name of the dashboard lane to query." }
            },
            required: ["action"]
        }
    },
    // 12. Analytics & Reports
    {
        name: "getReportMetrics",
        description: "Provides a wide range of analytics and performance metrics for claims, losses, schedules, dashboard lanes, and more. Identify claims using claimId, policyholderName, or address.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                metric: {
                    type: Type.STRING,
                    enum: [
                        "completedClaimsCount", "weeklyKpis", "claimStatusSummary", "inspectionsLastWeekCount",
                        "mostCommonClaimStatus", "loggedCallsCount", "mostActiveDayLastMonth",
                        "averageInspectionTime", "totalDriveTimeThisWeek", "yearToDateKpiSummary", "highestMileageDay",
                        "scheduledNotCompletedCount", "averageTimePerClaim", "rescheduledClaimsPercentageLastMonth",
                        "mostClaimsByStorm", "quarterlyPerformanceSummary", "totalClaimsCount", "compareMileage",
                        "averageClaimCompletionTime", "topZipCodesByClaimCount", "dashboardLaneCounts",
                        "mostRecentDashboardMove", "zeroClaimDashboardLanes", "lossTypeCounts", "mostFrequentLossType",
                        "mostCommonLossTypeByDate", "claimAge", "claimsWithOverdueTasks", "notesCreatedThisWeek",
                        "activityLog", "totalExpenses"
                    ]
                },
                period: { type: Type.STRING, description: "e.g., 'this week', 'last week', 'this month', 'last month', 'October 2025', 'quarter', 'year-to-date'." },
                claimId: { type: Type.STRING, description: "The unique ID of the claim. Use if known." },
                policyholderName: { type: Type.STRING, description: "The name of the insured. Use if claimId is unknown." },
                address: { type: Type.STRING, description: "The property address. Use if claimId is unknown." },
                year: { type: Type.NUMBER },
                date: { type: Type.STRING, description: "YYYY-MM-DD or month/year like 'October 2025'"}
            },
            required: ["metric"]
        }
    }
];