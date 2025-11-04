import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText, CheckCircle, XCircle, UserPlus, UserCheck } from 'lucide-react';

interface SubmissionTimelineProps {
  history: any;
  submission: any;
}

export function SubmissionTimeline({ history, submission }: SubmissionTimelineProps) {
  const getEventIcon = (eventType: string, details: any) => {
    // Check if this is a reopen action
    if (eventType === 'updated' && details?.action === 'reopened') {
      return { icon: FileText, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
    }
    
    switch (eventType) {
      case 'created':
        return { icon: FileText, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
      case 'updated':
        return { icon: FileText, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' };
      case 'submitted':
        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'approved':
        return { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'rejected':
        return { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600' };
      case 'assigned':
      case 'reassigned':
        return { icon: UserPlus, bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' };
      case 'claimed':
        return { icon: UserCheck, bgColor: 'bg-teal-100', iconColor: 'text-teal-600' };
      default:
        return { icon: FileText, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  const getEventLabel = (eventType: string, details: any) => {
    // Check if this is a reopen action
    if (eventType === 'updated' && details?.action === 'reopened') {
      return 'Reopened for Editing';
    }
    
    switch (eventType) {
      case 'created':
        return 'Draft Created';
      case 'updated':
        return 'Draft Updated';
      case 'submitted':
        // Check the status at the TIME of this event (from details), not current submission status
        if (details?.status === 'submitted') {
          return 'Submitted to Agency';
        }
        // If status was pending_approval, this means routed for approval
        if (details?.status === 'pending_approval') {
          return 'Routed for Approval';
        }
        // Fallback for old events without status in details
        return 'Submitted';
      case 'approved':
        return 'Approved by Doctor';
      case 'rejected':
        return 'Rejected';
      case 'assigned':
        return 'Assigned';
      case 'reassigned':
        return 'Reassigned';
      case 'claimed':
        return 'Claimed';
      default:
        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    }
  };

  const getEventDescription = (eventType: string, details: any) => {
    // Check if this is a reopen action
    if (eventType === 'updated' && details?.action === 'reopened') {
      return `Changed from ${details.previousStatus} back to ${details.newStatus}`;
    }
    
    // Handle assignment events
    if (eventType === 'assigned' || eventType === 'reassigned') {
      const parts = [];
      if (details?.assignedToName && details?.assignedToRole) {
        parts.push(`To: ${details.assignedToName} (${details.assignedToRole})`);
      }
      if (details?.note) {
        parts.push(`Note: ${details.note}`);
      }
      return parts.join(' • ');
    }
    
    if (eventType === 'claimed') {
      return 'Started working on this submission';
    }
    
    if (eventType === 'submitted') {
      // If routed for approval (status was pending_approval), show assigned doctor
      if (details?.status === 'pending_approval' && details?.assignedDoctorName) {
        return `Assigned to: ${details.assignedDoctorName}`;
      }
      // If submitted to agency (status was submitted), show agency name
      if (details?.status === 'submitted' && details?.agency) {
        return details.agency;
      }
      // Fallback to assigned doctor from submission if not in event details
      if (submission.assignedDoctorName && !details?.agency) {
        return `Assigned to: ${submission.assignedDoctorName}`;
      }
    }
    if (eventType === 'approved' && submission.approvedByName) {
      return `By: ${submission.approvedByName}`;
    }
    if (eventType === 'rejected' && details?.reason) {
      return `Reason: ${details.reason}`;
    }
    return null;
  };

  const sortedEvents = history && history.events && history.events.length > 0
    ? [...history.events]
        .sort((a, b) => {
          // First sort by timestamp
          const timeCompare = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          
          // If timestamps are the same or very close (within 1 second), enforce logical order
          if (Math.abs(timeCompare) < 1000) {
            // Define event priority (lower number = earlier in timeline)
            const eventPriority: Record<string, number> = {
              'created': 1,
              'updated': 2,
              'submitted_for_approval': 3,  // Routed for approval
              'approved': 4,  // Approved by doctor
              'submitted_to_agency': 5,  // Submitted to agency (must be after approved)
              'rejected': 6,
            };
            
            // Determine event types based on eventType and details
            const getEventPriority = (event: any) => {
              if (event.eventType === 'updated' && event.details?.action === 'reopened') {
                return 2; // Same as updated
              }
              if (event.eventType === 'submitted' && event.details?.status === 'pending_approval') {
                return eventPriority['submitted_for_approval'];
              }
              if (event.eventType === 'submitted' && event.details?.status === 'submitted') {
                return eventPriority['submitted_to_agency'];
              }
              if (event.eventType === 'approved') {
                return eventPriority['approved'];
              }
              return eventPriority[event.eventType] || 99;
            };
            
            return getEventPriority(a) - getEventPriority(b);
          }
          
          return timeCompare;
        })
        .reverse()
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEvents ? (
          sortedEvents.map((event: any, index: number) => {
            const { icon: Icon, bgColor, iconColor } = getEventIcon(event.eventType, event.details);

            return (
              <div key={index} className="flex gap-3">
                <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{getEventLabel(event.eventType, event.details)}</p>
                  {getEventDescription(event.eventType, event.details) && (
                    <p className="text-xs text-slate-600">{getEventDescription(event.eventType, event.details)}</p>
                  )}
                  <p className="text-xs text-slate-500">{event.userName}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-900">Created</p>
              <p className="text-xs text-slate-500">{submission.createdByName}</p>
              <p className="text-xs text-slate-500">
                {new Date(submission.createdDate).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
