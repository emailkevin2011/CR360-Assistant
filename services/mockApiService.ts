// Helper to format a Date object into YYYY-MM-DD string
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get dates relative to today for dynamic mocking
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);
const tenDaysAgo = new Date(today);
tenDaysAgo.setDate(today.getDate() - 10);
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(today.getDate() - 5);
const lastMonthDate = new Date();
lastMonthDate.setMonth(today.getMonth() - 1);
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);


const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);
const lastMonthDay10 = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10);
const lastMonthDay15 = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15);
const lastMonthDay20 = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 20);

// Mock data to simulate a backend database.
const mockClaims = [
    {
        claimId: 'CL-1001',
        policyNumber: 'POL-A789',
        claimant: 'John Doe',
        status: 'No Contact',
        dateOfLoss: '2024-07-15',
        details: 'Water damage in basement due to burst pipe.',
        stormId: 'ST-001'
    },
    {
        claimId: 'CL-1002',
        policyNumber: 'POL-B456',
        claimant: 'Jane Smith',
        status: 'Scheduled',
        dateOfLoss: '2024-07-20',
        details: 'Hail damage to roof and siding.',
        stormId: 'ST-003'
    },
    {
        claimId: 'CL-1003',
        policyNumber: 'POL-C123',
        claimant: 'Peter Jones',
        status: 'Completed',
        dateOfLoss: '2024-07-01',
        completionDate: formatDate(fiveDaysAgo), // Dynamically set to 5 days ago
        details: 'Kitchen fire, smoke and soot damage.',
        stormId: null
    },
    {
        claimId: 'CL-1004',
        policyNumber: 'POL-D987',
        claimant: 'Mary Johnson',
        status: 'Inspection Started',
        dateOfLoss: '2024-07-22',
        details: 'Vehicle impact to garage door.',
        stormId: 'ST-001'
    },
    {
        claimId: 'CL-1005',
        policyNumber: 'POL-E555',
        claimant: 'Sam Wilson',
        status: 'Completed',
        dateOfLoss: '2024-06-10',
        completionDate: formatDate(lastMonthDate), // Dynamically set to last month
        details: 'Fallen tree on property.',
        stormId: 'ST-001'
    },
    // Added for "October 2025" feature
    {
        claimId: 'CL-1006',
        policyNumber: 'POL-H123',
        claimant: 'Diana Prince',
        status: 'Completed',
        dateOfLoss: '2025-09-20',
        completionDate: '2025-10-15',
        details: 'Vandalism to storefront.',
        stormId: 'ST-002'
    },
    // Added for "Quarterly Summary" feature
    {
        claimId: 'CL-1007',
        policyNumber: 'POL-Q456',
        claimant: 'Bruce Wayne',
        status: 'Completed',
        dateOfLoss: '2024-08-01',
        completionDate: formatDate(oneMonthAgo),
        details: 'Batmobile repair.',
        stormId: null
    }
];

const mockActivities = [
    { date: formatDate(twoDaysAgo), time: '10:00', type: 'Phone Call', description: 'Call John Doe re: CL-1001' },
    { date: formatDate(yesterday), time: '14:00', type: 'Inspection', description: 'Inspect roof for Jane Smith (CL-1002)' },
    { date: formatDate(yesterday), time: '11:30', type: 'Phone Call', description: 'Follow up with Mary Johnson (CL-1004)'},
    { date: formatDate(tenDaysAgo), time: '09:00', type: 'Phone Call', description: 'Initial contact with Sam Wilson (CL-1005)'},
    // Add activities for last month for the new feature
    { date: formatDate(lastMonthDay10), time: '09:00', type: 'Email', description: 'Email client about new policy details.' },
    { date: formatDate(lastMonthDay10), time: '11:00', type: 'Meeting', description: 'Team sync on Q3 goals.' },
    { date: formatDate(lastMonthDay10), time: '15:00', type: 'Phone Call', description: 'Call vendor about invoice.' },
    { date: formatDate(lastMonthDay15), time: '10:30', type: 'Inspection', description: 'Site visit for new claim.' },
    { date: formatDate(lastMonthDay15), time: '14:00', type: 'Phone Call', description: 'Client follow-up call.' },
];

const mockInspections = [
    { claimId: 'CL-1002', date: formatDate(yesterday), inspectionTimeMinutes: 90 },
    { claimId: 'CL-1003', date: formatDate(fiveDaysAgo), inspectionTimeMinutes: 120 },
    { claimId: 'CL-1004', date: formatDate(twoDaysAgo), inspectionTimeMinutes: 75 },
    { claimId: 'CL-1005', date: formatDate(lastMonthDate), inspectionTimeMinutes: 110 },
    // Added for "Quarterly Summary" feature
    { claimId: 'CL-1007', date: formatDate(oneMonthAgo), inspectionTimeMinutes: 60 },
];

const mockMileageLogs = [
    { date: formatDate(threeDaysAgo), miles: 65 },
    { date: formatDate(twoDaysAgo), miles: 82 },
    { date: formatDate(yesterday), miles: 115 },
    { date: formatDate(today), miles: 45 },
];

const mockClaimHistory = [
    // Claim 1001 was scheduled and never changed
    { claimId: 'CL-1001', event: 'Scheduled', date: formatDate(lastMonthDay10) },
    // Claim 1002 was scheduled then rescheduled
    { claimId: 'CL-1002', event: 'Scheduled', date: formatDate(lastMonthDay10) },
    { claimId: 'CL-1002', event: 'Rescheduled', date: formatDate(lastMonthDay15) },
    // Claim 1004 was scheduled and not rescheduled
    { claimId: 'CL-1004', event: 'Scheduled', date: formatDate(lastMonthDay15) },
    // Claim 1005 was scheduled last month
    { claimId: 'CL-1005', event: 'Scheduled', date: formatDate(lastMonthDay20) },
    // A claim from two months ago, should be ignored
    { claimId: 'CL-0999', event: 'Rescheduled', date: '2024-05-10' }
];

const mockKpis = {
    week: {
        driveTime: '7.5 hours',
        inspectionTime: '12 hours',
        totalMiles: '345 miles'
    },
};

const mockRoutingGoals = {
    'ROUTING_GOAL_UNSPECIFIED': 0,
    'ROUTING_GOAL_CLOSER': 1,
    'ROUTING_GOAL_FASTER': 2,
    'ROUTING_GOAL_UNCOMMITTED': 3,
};

const mockMessages = [
    {
        claimId: "CL-J789-2025",
        policyHolder: "Julie Richards",
        from: "system",
        to: "Julie Richards",
        message: "Your claim has been received and is being processed.",
        isRead: false
    },
    {
        claimId: "CL-L456-2025",
        policyHolder: "Larry Thompson",
        from: "system",
        to: "Larry Thompson",
        message: "Please upload a photo of the damage.",
        isRead: true
    },
    {
        claimId: "CL-M123-2025",
        policyHolder: "Maria Garcia",
        from: "system",
        to: "Maria Garcia",
        message: "An adjuster has been assigned to your claim.",
        isRead: false
    },
];

const mockStorms = [
    { id: 'ST-001', name: 'Hurricane Alpha', active: true },
    { id: 'ST-002', name: 'Tornado Beta', active: false },
    { id: 'ST-003', name: 'Cyclone Gamma', active: true },
];

const mockLossTypes = ['Wind', 'Hail', 'Fire', 'Water', 'Theft', 'Vandalism'];

const mockTasks = [
    { id: 'TSK-001', description: 'Review new claim CL-1001', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // overdue
    { id: 'TSK-002', description: 'Contact claimant for CL-1002', dueDate: new Date() }, // due today
    { id: 'TSK-003', description: 'Schedule inspection for CL-1004', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }, // due in future
    { id: 'TSK-004', description: 'Finalize report for CL-1003', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, // overdue
];
/**
 * Simulates a backend API call for a given tool.
 * @param name The name of the tool to call.
 * @param args The arguments for the tool.
 * @returns A promise that resolves with the result of the tool call.
 */
export async function handleToolCall(name: string, args: any): Promise<any> {
    console.log(`Executing tool: ${name}`, args);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (name) {
        case 'searchClaims': {
            const { query } = args;
            if (!query) return { status: 'error', message: 'Query is required.' };
            const lowerQuery = query.toLowerCase();
            const results = mockClaims.filter(
                c => c.claimId.toLowerCase().includes(lowerQuery) ||
                    c.policyNumber.toLowerCase().includes(lowerQuery) ||
                    c.claimant.toLowerCase().includes(lowerQuery)
            );
            return { status: 'success', results };
        }

        case 'getClaimDetails': {
            const { claimId } = args;
            const claim = mockClaims.find(c => c.claimId === claimId);
            if (claim) {
                return { status: 'success', claim };
            }
            return { status: 'error', message: `Claim ${claimId} not found.` };
        }

        case 'getDashboard': {
            const dashboard = mockClaims.reduce((acc, claim) => {
                (acc[claim.status] = acc[claim.status] || []).push({ claimId: claim.claimId, claimant: claim.claimant });
                return acc;
            }, {} as Record<string, any[]>);
            return { status: 'success', dashboard };
        }

        case 'moveDashboardCard': {
            const { claimId, toLane } = args;
            const claim = mockClaims.find(c => c.claimId === claimId);
            if (claim) {
                claim.status = toLane;
                return { status: 'success', message: `Moved claim ${claimId} to ${toLane}.` };
            }
            return { status: 'error', message: `Claim ${claimId} not found.` };
        }

        case 'getReportMetrics': {
            const { period, month, year, metrics } = args;
            
            const today = new Date();
            const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);

            if (metrics && metrics.includes('mostClaimsByStorm')) {
                const claimCounts: Record<string, number> = {};
                mockClaims.forEach(claim => {
                    if (claim.stormId) {
                        claimCounts[claim.stormId] = (claimCounts[claim.stormId] || 0) + 1;
                    }
                });

                if (Object.keys(claimCounts).length === 0) {
                    return { status: 'success', metrics: { mostClaimsByStorm: 'No claims are associated with any storms.' } };
                }

                let maxClaims = 0;
                let stormIdWithMaxClaims = '';
                for (const stormId in claimCounts) {
                    if (claimCounts[stormId] > maxClaims) {
                        maxClaims = claimCounts[stormId];
                        stormIdWithMaxClaims = stormId;
                    }
                }

                const storm = mockStorms.find(s => s.id === stormIdWithMaxClaims);
                return {
                    status: 'success',
                    metrics: {
                        stormName: storm ? storm.name : 'Unknown Storm',
                        claimCount: maxClaims
                    }
                };
            }
            
            if (metrics && metrics.includes('rescheduledClaimsPercentageLastMonth')) {
                const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

                const eventsLastMonth = mockClaimHistory.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate >= firstDayLastMonth && eventDate <= lastDayLastMonth;
                });

                if (eventsLastMonth.length === 0) {
                    return { status: 'success', metrics: { rescheduledPercentage: 0 } };
                }

                const claimsWithActivity = new Set(eventsLastMonth.map(e => e.claimId));
                const rescheduledClaims = new Set(eventsLastMonth.filter(e => e.event === 'Rescheduled').map(e => e.claimId));
                
                const totalClaims = claimsWithActivity.size;
                const totalRescheduled = rescheduledClaims.size;

                if (totalClaims === 0) {
                    return { status: 'success', metrics: { rescheduledPercentage: 0 } };
                }

                const percentage = (totalRescheduled / totalClaims) * 100;
                
                return { status: 'success', metrics: { rescheduledPercentage: percentage.toFixed(1) } };
            }

            if (metrics && metrics.includes('highestMileageDay')) {
                if (!mockMileageLogs || mockMileageLogs.length === 0) {
                    return { status: 'success', metrics: { highestMileageDay: 'No mileage data available.' } };
                }

                let highestMileage = 0;
                let dayWithHighestMileage = '';

                for (const log of mockMileageLogs) {
                    if (log.miles > highestMileage) {
                        highestMileage = log.miles;
                        dayWithHighestMileage = log.date;
                    }
                }

                return { status: 'success', metrics: { highestMileageDay: dayWithHighestMileage, miles: highestMileage } };
            }

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            if (metrics && metrics.includes('averageInspectionTime')) {
                let inspectionsToAverage = mockInspections;
                let periodDescription = "all time";
    
                if (period === 'week') {
                    periodDescription = "this week";
                    inspectionsToAverage = mockInspections.filter(i => {
                        const inspectionDate = new Date(i.date);
                        return inspectionDate >= startOfWeek && inspectionDate <= endOfWeek;
                    });
                } else if (period === 'month') {
                    periodDescription = "this month";
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    inspectionsToAverage = mockInspections.filter(i => {
                       const inspectionDate = new Date(i.date);
                       return inspectionDate >= startOfMonth && inspectionDate <= endOfMonth;
                    });
                }
    
                if (inspectionsToAverage.length === 0) {
                  return { status: 'success', metrics: { averageInspectionTime: `No inspections found for ${periodDescription}.` } };
                }
    
                const totalMinutes = inspectionsToAverage.reduce((sum, i) => sum + i.inspectionTimeMinutes, 0);
                const averageMinutes = totalMinutes / inspectionsToAverage.length;
    
                return { status: 'success', metrics: { averageInspectionTime: `${averageMinutes.toFixed(0)} minutes`, period: periodDescription } };
            }

            if (metrics && metrics.includes('mostActiveDayLastMonth')) {
                const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

                const activitiesLastMonth = mockActivities.filter(a => {
                    const activityDate = new Date(a.date);
                    return activityDate >= firstDayLastMonth && activityDate <= lastDayLastMonth;
                });

                if (activitiesLastMonth.length === 0) {
                    return { status: 'success', metrics: { mostActiveDay: 'No activity last month', activityCount: 0 } };
                }

                const dailyCounts: Record<string, number> = {};
                activitiesLastMonth.forEach(a => {
                    dailyCounts[a.date] = (dailyCounts[a.date] || 0) + 1;
                });

                let mostActiveDay = '';
                let maxCount = 0;
                for (const date in dailyCounts) {
                    if (dailyCounts[date] > maxCount) {
                        maxCount = dailyCounts[date];
                        mostActiveDay = date;
                    }
                }

                return { status: 'success', metrics: { mostActiveDay, activityCount: maxCount } };
            }

            if (metrics && metrics.includes('claimStatusSummary')) {
                const closedStatuses = ['Completed', 'Cancelled'];
                const openClaimsCount = mockClaims.filter(c => !closedStatuses.includes(c.status)).length;
                const closedClaimsCount = mockClaims.filter(c => closedStatuses.includes(c.status)).length;
                
                const summary = {
                    openClaims: openClaimsCount,
                    closedClaims: closedClaimsCount,
                    totalClaims: mockClaims.length,
                };
                return { status: 'success', metrics: { claimStatusSummary: summary } };
            }

            if (metrics && metrics.includes('loggedCallsCount') && period === 'week') {
                const callsThisWeek = mockActivities.filter(a => {
                    const activityDate = new Date(a.date);
                    const isCall = a.type.toLowerCase() === 'phone call';
                    const isThisWeek = activityDate >= startOfWeek && activityDate <= endOfWeek;
                    return isCall && isThisWeek;
                });
                return { status: 'success', metrics: { loggedCallsThisWeek: callsThisWeek.length } };
            }
            
            if (period === 'quarter' && metrics && metrics.includes('quarterlyPerformanceSummary')) {
                const currentMonth = today.getMonth(); // 0-11
                const currentYear = today.getFullYear();
                const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

                const startOfQuarter = new Date(currentYear, quarterStartMonth, 1);
                startOfQuarter.setHours(0, 0, 0, 0);

                const endOfQuarter = new Date(currentYear, quarterStartMonth + 3, 0);
                endOfQuarter.setHours(23, 59, 59, 999);

                // 1. Completed Claims
                const completedThisQuarter = mockClaims.filter(c => {
                    if (c.status === 'Completed' && c.completionDate) {
                        const completionDate = new Date(c.completionDate);
                        return completionDate >= startOfQuarter && completionDate <= endOfQuarter;
                    }
                    return false;
                });

                // 2. Average Inspection Time
                const inspectionsThisQuarter = mockInspections.filter(i => {
                    const inspectionDate = new Date(i.date);
                    return inspectionDate >= startOfQuarter && inspectionDate <= endOfQuarter;
                });
                const totalMinutes = inspectionsThisQuarter.reduce((sum, i) => sum + i.inspectionTimeMinutes, 0);
                const avgInspectionTime = inspectionsThisQuarter.length > 0 ? totalMinutes / inspectionsThisQuarter.length : 0;

                // 3. Total Miles
                const milesThisQuarter = mockMileageLogs.filter(log => {
                    const logDate = new Date(log.date);
                    return logDate >= startOfQuarter && logDate <= endOfQuarter;
                });
                const totalMilesThisQuarter = milesThisQuarter.reduce((sum, log) => sum + log.miles, 0);

                // 4. Logged Calls
                const loggedCallsThisQuarter = mockActivities.filter(a => {
                    const activityDate = new Date(a.date);
                    const isCall = a.type.toLowerCase() === 'phone call';
                    return isCall && activityDate >= startOfQuarter && activityDate <= endOfQuarter;
                });

                return {
                    status: 'success',
                    metrics: {
                        period: `Q${Math.floor(currentMonth / 3) + 1} ${currentYear}`,
                        completedClaims: completedThisQuarter.length,
                        averageInspectionTime: `${avgInspectionTime.toFixed(0)} minutes`,
                        totalMiles: totalMilesThisQuarter,
                        loggedCalls: loggedCallsThisQuarter.length
                    }
                };
            }
            
            if (period === 'week') {
                if (metrics && Array.isArray(metrics) && (metrics.includes('driveTime') || metrics.includes('inspectionTime') || metrics.includes('totalMiles'))) {
                    const weeklyKpis: Record<string, any> = {};
                    metrics.forEach(metric => {
                        if (metric in mockKpis.week) {
                            (weeklyKpis as any)[metric] = (mockKpis.week as any)[metric];
                        }
                    });
                    return { status: 'success', metrics: weeklyKpis };
                }

                const completedThisWeek = mockClaims.filter(c => {
                    if (c.status === 'Completed' && c.completionDate) {
                        const completionDate = new Date(c.completionDate);
                        return completionDate >= startOfWeek && completionDate <= endOfWeek;
                    }
                    return false;
                });
                return { status: 'success', metrics: { completedClaimsThisWeek: completedThisWeek.length } };
            }

            if (period === 'month') {
                if (month && year) {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const monthIndex = isNaN(parseInt(month, 10))
                        ? monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase())
                        : parseInt(month, 10) - 1;

                    if (monthIndex === -1) {
                        return { status: 'error', message: `Invalid month: ${month}` };
                    }
                    const numericYear = parseInt(year, 10);

                    const completedInMonth = mockClaims.filter(c => {
                        if (c.status === 'Completed' && c.completionDate) {
                            const completionDate = new Date(c.completionDate);
                            return completionDate.getFullYear() === numericYear && completionDate.getMonth() === monthIndex;
                        }
                        return false;
                    });
                    return { status: 'success', metrics: { period: `${monthNames[monthIndex]} ${numericYear}`, completedClaims: completedInMonth.length } };
                } else {
                     // Handle current month, e.g., "this month"
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    endOfMonth.setHours(23, 59, 59, 999);
                    
                    const completedThisMonth = mockClaims.filter(c => {
                        if (c.status === 'Completed' && c.completionDate) {
                            const completionDate = new Date(c.completionDate);
                            return completionDate >= startOfMonth && completionDate <= endOfMonth;
                        }
                        return false;
                    });
                    return { status: 'success', metrics: { completedClaimsThisMonth: completedThisMonth.length } };
                }
            }

            return { status: 'error', message: `The requested metrics for period '${period}' are not supported. Try asking for weekly KPIs or claim counts for 'week' or 'month'.` };
        }

        case 'listActivities': {
            const { date } = args;
            const activities = mockActivities.filter(a => a.date === date);
            return { status: 'success', activities };
        }

        case 'createActivity': {
            const { date, time, type, description } = args;
            const newActivity = { date, time, type, description };
            mockActivities.push(newActivity);
            return { status: 'success', activity: newActivity };
        }
        
        case 'getRoutingGoals': {
            return { status: 'success', goals: mockRoutingGoals };
        }
        
        case 'findClaimByName': {
            const { insuredName } = args;
            const claim = mockClaims.find(c => c.claimant.toLowerCase() === insuredName.toLowerCase());
            if (claim) {
                return { status: 'success', claim };
            }
            return { status: 'error', message: `Claim for ${insuredName} not found.` };
        }
        
        case 'searchMessages': {
            const { query } = args;
            const messages = mockMessages.filter(m => m.policyHolder.toLowerCase().includes(query.toLowerCase()));
            const lastMessage = messages.pop();
            return { status: 'success', lastMessage: lastMessage?.message };
        }

        case 'getUnreadMessages': {
            const unreadMessages = mockMessages.filter(m => !m.isRead);
            return { status: 'success', messages: unreadMessages };
        }

        case 'listStorms': {
            const { active } = args;
            if (active) {
                return { status: 'success', storms: mockStorms.filter(s => s.active) };
            }
            return { status: 'success', storms: mockStorms };
        }

        case 'listLossTypes': {
            return { status: 'success', lossTypes: mockLossTypes };
        }

        case 'searchTasks': {
            const { status } = args;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (status === 'overdue') {
                const overdueTasks = mockTasks.filter(t => new Date(t.dueDate) < today);
                return { status: 'success', tasks: overdueTasks };
            }
            if (status === 'due_today') {
                const dueTodayTasks = mockTasks.filter(t => new Date(t.dueDate).toDateString() === today.toDateString());
                return { status: 'success', tasks: dueTodayTasks };
            }
            return { status: 'error', message: 'Invalid task status provided.' };
        }

        default:
            return { status: 'error', message: `Tool '${name}' not found.` };
    }
}
