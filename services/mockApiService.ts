// Mock API to simulate backend operations for ClaimRoute 360

// --- HELPER FUNCTIONS ---
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

const today = new Date();
const yesterday = addDays(today, -1);
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);
const dayBeforeYesterday = addDays(today, -2);

const getStartAndEndOfWeek = (date: Date) => {
    const start = addDays(date, -date.getDay()); // Sunday
    const end = addDays(start, 6); // Saturday
    return { start: formatDate(start), end: formatDate(end) };
};

const getStartAndEndOfMonth = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
};


// --- MOCK DATA (Stateful) ---
let mockRoutingGoals = { startTime: "08:30", lunchTime: "12:00-12:45", maxStops: 5, optimizationType: "minimumDistance", bufferMinutes: 15 };
let mockLossTypes = [{ id: 'lt1', name: 'Hail' }, { id: 'lt2', name: 'Structure Fire' }, { id: 'lt3', name: 'Wind' }, { id: 'lt4', name: 'Water Damage' }];
let mockStorms = [{ id: 'ST1', name: 'Hurricane Helene', location: 'Houston Metro Area', active: true }, { id: 'ST2', name: 'Winter Storm Bianca', location: 'Dallas TX', active: false }, { id: 'ST3', name: 'Hurricane Carla', location: 'Galveston TX', active: true }];
let mockUsers = [{ id: 'u1', name: 'Lisa Green', email: 'lisa.green@cr360.com', role: 'adjuster', status: 'active', creationDate: formatDate(addDays(today, -40))}, { id: 'u2', name: 'John Smith', email: 'john.smith@cr360.com', role: 'sub-admin', status: 'active', creationDate: formatDate(addDays(today, -10)) }, { id: 'u3', name: 'Test Account', email: 'test@cr360.com', role: 'adjuster', status: 'inactive', creationDate: formatDate(addDays(today, -2)) }];
let mockClaims: Record<string, any> = {
    'CLM-1459': { policyholderName: 'Julie Richards', lossType: 'Water Damage', creationDate: '2025-10-01', status: 'Open', completionDate: null, carrier: 'Allstate', assignedUser: 'Lisa Green', hasPhotos: true, stormId: null, policyNumber: 'P9876543' },
    'CLM-2222': { policyholderName: 'Michael Scott', lossType: 'Wind', creationDate: '2025-09-15', status: 'Scheduled', completionDate: null, carrier: 'State Farm', assignedUser: 'Lisa Green', hasPhotos: true, stormId: 'ST1', policyNumber: 'P5432109' },
    'CLM-78916': { policyholderName: 'Carlos Ray', lossType: 'Wind', creationDate: '2025-11-02', status: 'Completed', completionDate: formatDate(yesterday), carrier: 'Farmers Insurance', assignedUser: 'Lisa Green', hasPhotos: false, stormId: 'ST3', policyNumber: 'P1122334' },
    'CLM-1120': { policyholderName: 'Flood Test', lossType: 'Flood', creationDate: formatDate(today), status: 'New', completionDate: null, carrier: null, assignedUser: null, hasPhotos: false, stormId: null, policyNumber: null },
    'CLM-9001': { policyholderName: 'Sarah Bennett', lossType: 'Hail', creationDate: formatDate(addDays(today, -5)), status: 'Inspection Started', completionDate: null, carrier: 'Farmers Insurance', assignedUser: 'Lisa Green', hasPhotos: true, stormId: 'ST2', policyNumber: 'P1234567', secondaryContact: 'Jake Bennett' },
    'CLM-MC1': { policyholderName: 'Marty McFly', lossType: 'Structure Fire', creationDate: formatDate(addDays(today, -12)), status: 'Contacted', completionDate: null, carrier: 'State Farm', assignedUser: null, hasPhotos: false, stormId: null, policyNumber: null }
};
const mockClaimantDetails: Record<string, any> = {
    'CLM-1459': { name: 'Julie Richards', phone: '214-555-1234', address: { street: '456 Elm St', city: 'Dallas', state: 'TX', zip: '75201' }, email: 'julie.richards@example.com' },
    'CLM-2222': { name: 'Michael Scott', phone: '570-555-0100', address: { street: '1725 Slough Ave', city: 'Houston', state: 'TX', zip: '77002' }, email: 'michael.scott@example.com' },
    'CLM-78916': { name: 'Carlos Ray', phone: '817-555-4321', address: { street: '987 Fighter Jet Ave', city: 'Galveston', state: 'TX', zip: '77550' }, email: 'carlos.ray@example.com' },
    'CLM-1120': { name: 'Flood Test', phone: null, address: { street: '1 River Rd', city: 'Houston', state: 'TX', zip: '77010' }, email: 'flood.test@example.com' },
    'CLM-9001': { name: 'Sarah Bennett', phone: '214-555-1000', address: { street: '505 Maple Ln', city: 'Dallas', state: 'TX', zip: '75204' }, email: 'sarah.bennett@example.com' },
    'CLM-MC1': { name: 'Marty McFly', phone: '555-888-9999', address: { street: '1 Hill Valley Rd', city: 'Houston', state: 'TX', zip: '77009' }, email: 'mcfly@example.com' },
};
let mockSchedule: any[] = [
    { claimId: 'CLM-2222', claimant: 'Michael Scott', date: formatDate(today), time: '09:00', durationMinutes: 60, status: "Scheduled" },
    { claimId: 'CLM-MC1', claimant: 'Marty McFly', date: formatDate(today), time: '11:00', durationMinutes: 45, status: "Scheduled" },
    { claimId: 'CLM-9001', claimant: 'Sarah Bennett', date: formatDate(tomorrow), time: '10:00', durationMinutes: 90, status: "Scheduled" },
    { claimId: 'CLM-1459', claimant: 'Julie Richards', date: formatDate(dayAfterTomorrow), time: '14:00', durationMinutes: 75, status: "No Contact" },
];
let mockMessages = [{ claimId: "CLM-1459", from: 'claimant', to: 'adjuster', text: "Just wanted to confirm our appointment.", timestamp: new Date(today.getTime() - 3 * 60 * 60 * 1000).toISOString(), isRead: false, policyholderName: 'Julie Richards' }, { claimId: "CLM-1459", from: 'adjuster', to: 'claimant', text: "Confirmed!", timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), isRead: true }];
const mockSystemSettings: Record<string, any> = { autoTextsEnabled: true, remindersEnabled: true, dndRange: "10 p.m. to 7 a.m." };
let mockMessageTemplates = [{ name: "Intro Text", content: "Hi, this is your adjuster from Claim Route 360." }];
let mockTasks: { id: string; claimId: string; description: string; dueDate: string; dueTime?: string | null; status: string; }[] = [{ id: 't1', claimId: 'CLM-2222', description: 'Review initial claim report.', dueDate: formatDate(yesterday), status: 'completed' }, { id: 't2', claimId: 'CLM-1459', description: 'Call insured after inspection', dueDate: formatDate(tomorrow), status: 'open' }, { id: 't3', claimId: 'CLM-9001', description: 'Order satellite imagery of the roof.', dueDate: formatDate(dayBeforeYesterday), status: 'open' }];
let mockNotes: { id: string; claimId: string; content: string; creationDate: string }[] = [{ id: 'n1', claimId: 'CLM-78916', content: 'Met with contractor onsite. Took photos of roof damage.', creationDate: formatDate(yesterday) }, { id: 'n2', claimId: 'CLM-1459', content: 'Insured rescheduled due to rain.', creationDate: formatDate(today) }];
let mockDashboard: Record<string, string[]> = { 'New': ['CLM-1120'], 'Contacted': ['CLM-MC1'], 'Scheduled': ['CLM-2222'], 'Inspection Started': ['CLM-9001'], 'No Contact': ['CLM-1459'], 'Completed': ['CLM-78916'], 'Cancelled': [] };
let mockDashboardHistory: { claimId: string, toLane: string, timestamp: string }[] = [{ claimId: 'CLM-78916', toLane: 'Completed', timestamp: new Date().toISOString() }];
const mockClaimHistory = [{ claimId: 'CLM-1459', event: 'Rescheduled', date: formatDate(addDays(today, -35)) }, { claimId: 'CLM-1459', event: 'Rescheduled', date: formatDate(addDays(today, -32)) }];
const mockActivities = [{ type: 'phone_call', date: formatDate(today), claimId: 'CLM-1459' }, { type: 'email', date: formatDate(yesterday), claimId: 'CLM-2222' }, { type: 'note', date: formatDate(addDays(today, -40)), claimId: 'CLM-9001' }];
const mockExpenses = { '2025': 12345.67 };
const mockInspections = [{ claimId: 'CLM-78916', date: formatDate(yesterday), durationMinutes: 75 }];
const mockMileageLogs = [{ date: formatDate(yesterday), miles: 68 }, { date: formatDate(addDays(today,-35)), miles: 80 }];
const mockRoutes = { [formatDate(today)]: { totalDistanceMiles: 45, totalDurationMinutes: 125 }, [formatDate(yesterday)]: { totalDistanceMiles: 62, totalDurationMinutes: 150 } };

// --- NEW Universal Claim ID Lookup ---
function findClaimId(args: { claimId?: string, policyholderName?: string, address?: string }): string | null {
    const { claimId, policyholderName, address } = args;

    if (claimId && mockClaims[claimId]) {
        return claimId;
    }

    const lowerCaseName = policyholderName?.toLowerCase();
    if (lowerCaseName) {
        // Find by exact match first, then partial.
        let foundId = Object.keys(mockClaimantDetails).find(id => mockClaimantDetails[id].name.toLowerCase() === lowerCaseName);
        if (foundId) return foundId;
        
        // Fallback to partial match
        foundId = Object.keys(mockClaimantDetails).find(id => mockClaimantDetails[id].name.toLowerCase().includes(lowerCaseName));
        if (foundId) return foundId;
    }

    const lowerCaseAddress = address?.toLowerCase();
    if (lowerCaseAddress) {
        const foundId = Object.keys(mockClaimantDetails).find(id => {
            const addr = mockClaimantDetails[id].address;
            if (!addr) return false;
            const fullAddress = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
            return fullAddress.toLowerCase().includes(lowerCaseAddress);
        });
        if (foundId) return foundId;
    }

    return null;
}

// --- TOOL IMPLEMENTATION ---
export async function handleToolCall(name: string, args: any): Promise<any> {
    console.log(`Handling tool call: ${name}`, args);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay

    const resolvedClaimId = findClaimId(args);

    switch (name) {
        case 'manageClaim': {
            const { action, updates } = args;
            if ((action === 'getDetails' || action === 'update') && !resolvedClaimId) {
                return { status: 'error', message: 'Claim not found with the provided details.' };
            }
            switch (action) {
                case 'create': {
                    const newClaimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
                    mockClaims[newClaimId] = { ...updates, creationDate: formatDate(today), status: 'New' };
                    
                    let addressParts = { street: '', city: '', state: '', zip: '' };
                    if (updates.address && typeof updates.address === 'string') {
                        const [street, city, state, zip] = (updates.address || '').split(/, | /);
                        addressParts = { street, city, state, zip };
                    }
                    
                    mockClaimantDetails[newClaimId] = { name: updates.policyholderName, phone: null, address: addressParts, email: null };
                    return { status: 'success', message: `Claim ${newClaimId} created.` };
                }
                case 'getDetails':
                    if (mockClaimantDetails[resolvedClaimId!] && mockClaims[resolvedClaimId!]) {
                        const fullAddress = mockClaimantDetails[resolvedClaimId!].address;
                        return { ...mockClaimantDetails[resolvedClaimId!], ...mockClaims[resolvedClaimId!], address: `${fullAddress.street}, ${fullAddress.city}, ${fullAddress.state} ${fullAddress.zip}` };
                    }
                    return { status: 'error', message: 'Claim not found.' }; // Fallback
                case 'update':
                    if (mockClaims[resolvedClaimId!]) {
                        Object.assign(mockClaims[resolvedClaimId!], updates);
                        if(updates.phoneNumber && mockClaimantDetails[resolvedClaimId!]) mockClaimantDetails[resolvedClaimId!].phone = updates.phoneNumber;
                        if (updates.stormName) {
                            const storm = mockStorms.find(s => s.name === updates.stormName);
                            if (storm) mockClaims[resolvedClaimId!].stormId = storm.id;
                        }
                        return { status: 'success', message: `Claim ${resolvedClaimId} updated.` };
                    }
                     return { status: 'error', message: 'Claim not found.' }; // Fallback
            }
            break;
        }
        case 'searchClaims': {
            let results = Object.keys(mockClaims);
            if (args.status) results = results.filter(id => mockClaims[id].status.toLowerCase() === args.status.toLowerCase());
            if (args.lossType) results = results.filter(id => mockClaims[id].lossType === args.lossType);
            if (args.city) results = results.filter(id => mockClaimantDetails[id].address.city.toLowerCase() === args.city.toLowerCase());
            if (args.carrier) results = results.filter(id => mockClaims[id].carrier === args.carrier);
            if (args.createdAfter) results = results.filter(id => mockClaims[id].creationDate > args.createdAfter);
            if (args.hasPhotos !== undefined) results = results.filter(id => mockClaims[id].hasPhotos === args.hasPhotos);
            if (args.lastNamePrefix) results = results.filter(id => mockClaimantDetails[id].name.split(' ')[1].toLowerCase().startsWith(args.lastNamePrefix.toLowerCase()));
            if (args.zipCodeStart && args.zipCodeEnd) results = results.filter(id => mockClaimantDetails[id].address.zip >= args.zipCodeStart && mockClaimantDetails[id].address.zip <= args.zipCodeEnd);
            if(args.isMissingPhoneNumber) results = results.filter(id => !mockClaimantDetails[id].phone);
            if(args.isUnscheduled) {
                const scheduledIds = new Set(mockSchedule.map(a => a.claimId));
                results = results.filter(id => !scheduledIds.has(id));
            }
            if (args.stormName) {
                const storm = mockStorms.find(s => s.name === args.stormName);
                results = results.filter(id => mockClaims[id].stormId === storm?.id);
            }
            return { claims: results.map(id => ({ claimId: id, policyholderName: mockClaims[id].policyholderName })) };
        }
        case 'manageSchedule': {
            const { action, date, newTime, timeBlock, shiftMinutes, claimantName } = args;
            if (action !== 'get' && action !== 'findOpenTimeSlots' && action !== 'scheduleBreak' && !resolvedClaimId && !claimantName) {
                 return { status: 'error', message: 'Claim not found with the provided details.' };
            }
            switch(action) {
                case 'get':
                    const targetDate = date === 'tomorrow' ? formatDate(tomorrow) : date || formatDate(today);
                    return { schedule: mockSchedule.filter(item => item.date === targetDate) };
                case 'rescheduleClaim':
                     const apptIndex = mockSchedule.findIndex(a => a.claimId === resolvedClaimId);
                    if(apptIndex > -1) {
                        mockSchedule[apptIndex].date = date; // Simplification
                        mockSchedule[apptIndex].time = newTime;
                        return { status: 'success', message: 'Claim rescheduled.' };
                    }
                    return { status: 'error', message: 'Appointment not found.' };
                case 'shiftAppointments': return { status: 'success', message: `Shifted ${timeBlock} appointments by ${shiftMinutes} minutes.` };
                case 'cancelAppointments': return { status: 'success', message: `Cancelled appointments for ${args.day}.` };
                case 'scheduleNewClaim': return { status: 'success', message: `Claim ${resolvedClaimId} scheduled.` };
                case 'calculateIdleTime': return { idleTimeMinutes: 45 };
                case 'findOverlappingAppointments': return { count: 0, message: 'No overlapping appointments found.' };
                case 'rescheduleToEarliestAvailable': return { status: 'success', message: `Rescheduled ${claimantName} for ${formatDate(tomorrow)} at 09:00.` };
                case 'findOpenTimeSlots': return { slots: ["09:00-10:00", "11:00-12:00"] };
                case 'scheduleBreak': return { status: 'success', message: 'Break scheduled.' };
                case 'rebookClaimsByStatus': return { status: 'success', message: `Rebooked claims with status ${args.claimStatusToRebook}.` };
            }
            break;
        }
        case 'manageRouting': {
            const { action, goals, optimizationStrategy, metric, date } = args;
            switch (action) {
                case 'getGoals': return { goals: mockRoutingGoals };
                case 'setGoals': { mockRoutingGoals = {...mockRoutingGoals, ...goals}; return { status: 'success', message: 'Routing goals updated.' }; }
                case 'optimize': return { status: 'success', message: `Route optimized with strategy: ${optimizationStrategy}.` };
                case 'findFurthestClaim': return { claim: { claimId: 'CLM-9001', distanceMiles: 250 }};
                case 'getMetrics':
                    const targetDate = date || formatDate(today);
                    if (metric === 'totalDistance') return { distanceMiles: mockRoutes[targetDate]?.totalDistanceMiles };
                    if (metric === 'totalDuration') return { durationMinutes: mockRoutes[targetDate]?.totalDurationMinutes };
                    if (metric === 'compareMinutesSavedTodayVsYesterday') {
                        const todayRoute = mockRoutes[formatDate(today)];
                        const yesterdayRoute = mockRoutes[formatDate(yesterday)];
                        return { minutesSaved: (yesterdayRoute?.totalDurationMinutes || 0) - (todayRoute?.totalDurationMinutes || 0) };
                    }
            }
            break;
        }
        case 'manageCommunication': {
            const { action, message, subject, templateName, searchPeriod, searchPolicyholderName, isUnread, getMostRecent, limit, templateAction, templateContent, settingsAction, settings, dateForReminders } = args;
            if (action === 'send' && !resolvedClaimId) {
                return { status: 'error', message: 'Claim not found for communication.' };
            }
            switch (action) {
                case 'send':
                    if (subject) return { status: 'success', message: 'Email sent.' };
                    if (templateName) return { status: 'success', message: 'Message sent from template.' };
                    mockMessages.push({ claimId: resolvedClaimId!, from: 'adjuster', to: 'claimant', text: message, timestamp: new Date().toISOString(), isRead: true, policyholderName: mockClaims[resolvedClaimId!].policyholderName }); 
                    return { status: 'success', message: 'Message sent.' };
                case 'search':
                    let msgResults = [...mockMessages];
                    if (resolvedClaimId) msgResults = msgResults.filter(m => m.claimId === resolvedClaimId);
                    if (searchPeriod === 'today') msgResults = msgResults.filter(m => m.timestamp.startsWith(formatDate(today)));
                    if (searchPolicyholderName) msgResults = msgResults.filter(m => m.policyholderName === searchPolicyholderName);
                    if (isUnread) msgResults = msgResults.filter(m => !m.isRead && m.to === 'adjuster');
                    msgResults.sort((a,b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf());
                    if (getMostRecent) return { message: msgResults[0] };
                    return { messages: limit ? msgResults.slice(0, limit) : msgResults };
                case 'manageTemplate':
                    switch (templateAction) {
                        case 'create': mockMessageTemplates.push({ name: templateName, content: templateContent }); return { status: 'success', message: 'Template created.' };
                        case 'update': 
                            const template = mockMessageTemplates.find(t => t.name === templateName);
                            if(template) { template.content = templateContent; return { status: 'success', message: 'Template updated.' }; }
                            return { status: 'error', message: 'Template not found.' };
                        case 'delete': mockMessageTemplates = mockMessageTemplates.filter(t => t.name !== templateName); return { status: 'success', message: 'Template deleted.' };
                        case 'list': return { templates: mockMessageTemplates };
                    }
                    break;
                case 'manageSettings':
                     switch (settingsAction) {
                        case 'get': return { setting: mockSystemSettings };
                        case 'set': Object.assign(mockSystemSettings, settings); return { status: 'success', message: 'Settings updated.' };
                    }
                    break;
                case 'bulkSendReminders': return { status: 'success', message: `Reminders sent for ${dateForReminders}.` };
            }
            break;
        }
        case 'manageStorms': {
            const { action, stormId, updates, locationFilter, statusFilter } = args;
            switch (action) {
                case 'create': { const newStorm = {id: stormId, ...updates}; mockStorms.push(newStorm); return { status: 'success', message: `Storm ${updates.name} created.` }; }
                case 'update': { 
                    const storm = mockStorms.find(s => s.id === stormId);
                    if(storm) { Object.assign(storm, updates); return { status: 'success', message: 'Storm updated.' }; }
                    return { status: 'error', message: 'Storm not found.' };
                }
                case 'delete': { mockStorms = mockStorms.filter(s => s.id !== stormId); return { status: 'success', message: 'Storm deleted.' }; }
                case 'list': {
                    let results = [...mockStorms];
                    if(statusFilter) results = results.filter(s => s.active === (statusFilter === 'active'));
                    if(locationFilter) results = results.filter(s => s.location.includes(locationFilter.split(' ')[0]));
                    return { storms: results };
                }
                case 'assignToLocation': {
                    const storm = mockStorms.find(s => s.name === updates.name);
                    if(!storm) return {status: 'error', message: 'Storm not found.'};
                    Object.keys(mockClaimantDetails).forEach(id => { if(mockClaimantDetails[id].address.city === locationFilter) mockClaims[id].stormId = storm.id; });
                    return { status: 'success', message: 'Storm assigned.' };
                }
            }
            break;
        }
        case 'manageLossTypes': {
            const { action, name, oldName, newName } = args;
            switch(action) {
                case 'create': mockLossTypes.push({id: `lt${mockLossTypes.length+1}`, name}); return { status: 'success', message: 'Loss type created.' };
                case 'update': {
                    const lt = mockLossTypes.find(l => l.name === oldName);
                    if(lt) { lt.name = newName; return { status: 'success', message: 'Loss type updated.' }; }
                    return { status: 'error', message: 'Loss type not found.' };
                }
                case 'delete': mockLossTypes = mockLossTypes.filter(l => l.name !== name); return { status: 'success', message: 'Loss type deleted.' };
                case 'list': return { lossTypes: [...mockLossTypes].sort((a,b) => a.name.localeCompare(b.name)) };
            }
            break;
        }
        case 'manageUser': {
            const { action, name, updates, filters } = args;
            switch (action) {
                case 'create': { const newUser = {id: `u${mockUsers.length+1}`, name, ...updates, status: 'active', creationDate: formatDate(today)}; mockUsers.push(newUser); return { status: 'success', message: 'User created.' }; }
                case 'update': {
                    const user = mockUsers.find(u => u.name === name);
                    if(user) { Object.assign(user, updates); return { status: 'success', message: 'User updated.' }; }
                    return { status: 'error', message: 'User not found.' };
                }
                case 'delete': mockUsers = mockUsers.filter(u => u.name !== name); return { status: 'success', message: 'User deleted.' };
                case 'resetPassword': return { status: 'success', message: `Password reset link sent for ${name}.` };
                case 'list': {
                    let results = [...mockUsers];
                    if(filters?.role) results = results.filter(u => u.role === filters.role);
                    if(filters?.status) results = results.filter(u => u.status === filters.status);
                    if(filters?.createdThisMonth) {
                        const { start } = getStartAndEndOfMonth(today);
                        results = results.filter(u => new Date(u.creationDate) >= start);
                    }
                    return { users: results };
                }
            }
            break;
        }
        case 'manageTasks': {
            const { action, taskId, updates, keyword, date, taskIdentifier } = args;
            if (!resolvedClaimId) {
                return { status: 'error', message: 'Claim not found to manage tasks.' };
            }
            switch(action) {
                case 'create': { const newTask = { id: `t${mockTasks.length + 1}`, status: 'open', claimId: resolvedClaimId, ...updates }; mockTasks.push(newTask); return { status: 'success', message: 'Task created.' }; }
                case 'update': {
                    const task = mockTasks.find(t => t.id === taskId);
                    if(task) { Object.assign(task, updates); return { status: 'success', message: 'Task updated.' }; }
                    return { status: 'error', message: 'Task not found.' };
                }
                case 'list': return { tasks: mockTasks.filter(t => t.claimId === resolvedClaimId) };
                case 'delete': {
                    if (taskIdentifier === 'most recent') {
                        const tasks = mockTasks.filter(t => t.claimId === resolvedClaimId).sort((a,b) => b.id.localeCompare(a.id));
                        if (tasks.length > 0) { mockTasks = mockTasks.filter(t => t.id !== tasks[0].id); return {status: 'success', message: 'Task deleted.'}; }
                    }
                    return { status: 'error', message: 'Task not found.' };
                }
                case 'searchByKeyword': return { tasks: mockTasks.filter(t => t.description.toLowerCase().includes(keyword.toLowerCase())) };
                case 'bulkCreateForSchedule': return { status: 'success', message: `Bulk tasks created for ${date}.` };
            }
            break;
        }
        case 'manageNotes': {
            const { action, noteId, content } = args;
            if (!resolvedClaimId) {
                return { status: 'error', message: 'Claim not found to manage notes.' };
            }
            switch (action) {
                case 'add': { const newNote = { id: `n${mockNotes.length + 1}`, creationDate: formatDate(today), claimId: resolvedClaimId, content }; mockNotes.push(newNote); return { status: 'success', message: 'Note added.' }; }
                case 'update': {
                    const note = mockNotes.find(n => n.id === noteId);
                    if(note) { note.content = content; return { status: 'success', message: 'Note updated.' }; }
                    return { status: 'error', message: 'Note not found.' };
                }
                case 'list': return { notes: mockNotes.filter(n => n.claimId === resolvedClaimId) };
                case 'delete': { mockNotes = mockNotes.filter(n => n.id !== noteId); return { status: 'success', message: 'Note deleted.' }; }
            }
            break;
        }
        case 'manageDashboard': {
            const { action, stormNameFilter, targetLane, sourceLane, laneName } = args;
            if ((action === 'moveClaim') && !resolvedClaimId) {
                return { status: 'error', message: 'Claim not found to move on dashboard.' };
            }
            switch (action) {
                case 'get':
                    if(stormNameFilter) {
                        const storm = mockStorms.find(s => s.name === stormNameFilter);
                        if(!storm) return {status: 'error', message: 'Storm not found.'};
                        const filteredDashboard: Record<string, string[]> = {};
                        for (const lane in mockDashboard) {
                            filteredDashboard[lane] = mockDashboard[lane].filter(cid => mockClaims[cid]?.stormId === storm.id);
                        }
                        return { dashboard: filteredDashboard };
                    }
                    return { dashboard: mockDashboard };
                case 'getLaneContents':
                    return { claims: mockDashboard[laneName] || [] };
                case 'moveClaim':
                    for (const lane in mockDashboard) { mockDashboard[lane] = mockDashboard[lane].filter(id => id !== resolvedClaimId); }
                    if(mockDashboard[targetLane]) mockDashboard[targetLane].push(resolvedClaimId!);
                    mockDashboardHistory.push({ claimId: resolvedClaimId!, toLane: targetLane, timestamp: new Date().toISOString() });
                    return { status: 'success', message: 'Claim moved.' };
                case 'bulkMoveLanes':
                    const claimsToMove = mockDashboard[sourceLane] || [];
                    if(mockDashboard[targetLane]) mockDashboard[targetLane].push(...claimsToMove);
                    mockDashboard[sourceLane] = [];
                    return { status: 'success', message: `Moved ${claimsToMove.length} claims.` };
            }
            break;
        }
        case 'getReportMetrics': {
            const { metric, period, year, date } = args;
            if (metric === 'claimAge' && !resolvedClaimId) {
                 return { status: 'error', message: 'Claim not found to calculate age.' };
            }
            switch(metric) {
                case 'completedClaimsCount': {
                     const { start } = getStartAndEndOfWeek(today);
                     const count = Object.values(mockClaims).filter(c => c.status === 'Completed' && c.completionDate >= start).length;
                     return { count };
                }
                case 'claimStatusSummary': {
                    const open = Object.values(mockClaims).filter(c => c.status !== 'Completed' && c.status !== 'Cancelled').length;
                    const closed = Object.values(mockClaims).length - open;
                    return { open, closed };
                }
                case 'totalClaimsCount': return { count: Object.keys(mockClaims).length };
                case 'quarterlyPerformanceSummary': return { summary: "42 claims completed, 65m avg inspection time, 1200 total miles."};
                case 'dashboardLaneCounts': {
                    const counts = Object.fromEntries(Object.entries(mockDashboard).map(([lane, claims]) => [lane, claims.length]));
                    return { counts };
                }
                case 'mostRecentDashboardMove': return { move: mockDashboardHistory.sort((a,b) => new Date(b.timestamp).valueOf() - new Date(a.timestamp).valueOf())[0] };
                case 'zeroClaimDashboardLanes': return { lanes: Object.keys(mockDashboard).filter(lane => mockDashboard[lane].length === 0) };
                case 'lossTypeCounts': {
                    const counts = Object.values(mockClaims).reduce((acc, claim) => { if(claim.lossType) acc[claim.lossType] = (acc[claim.lossType] || 0) + 1; return acc; }, {} as Record<string, number>);
                    return { counts };
                }
                case 'mostFrequentLossType': {
                    const counts = Object.values(mockClaims).reduce((acc, claim) => { if(claim.lossType) acc[claim.lossType] = (acc[claim.lossType] || 0) + 1; return acc; }, {} as Record<string, number>);
                    const mostFrequent = Object.entries(counts).sort(([,a],[,b]) => (b as number) - (a as number))[0];
                    return { mostFrequent: { lossType: mostFrequent[0], count: mostFrequent[1] } };
                 }
                case 'claimAge': {
                    const age = Math.floor((today.getTime() - new Date(mockClaims[resolvedClaimId!].creationDate).getTime()) / (1000 * 3600 * 24));
                    return { ageInDays: age };
                }
                case 'claimsWithOverdueTasks': {
                    const overdueTaskClaimIds = new Set(mockTasks.filter(t => t.dueDate < formatDate(today) && t.status === 'open').map(t => t.claimId));
                    return { claims: Array.from(overdueTaskClaimIds) };
                }
                case 'notesCreatedThisWeek': {
                    const { start } = getStartAndEndOfWeek(today);
                    return { notes: mockNotes.filter(n => n.creationDate >= start) };
                }
                case 'activityLog': return { activities: date ? mockActivities.filter(a => a.date === date) : mockActivities };
                case 'totalExpenses': return { total: mockExpenses[year] || 0 };
            }
            return { result: "Metric result would be here."};
        }
        default:
            return { status: 'error', message: `Tool '${name}' not found.` };
    }
}