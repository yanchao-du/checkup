import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Eye, UserCheck, Clock, CheckCircle2 } from 'lucide-react';
import { getSubmissionStatusBadgeVariant, getSubmissionStatusLabel } from '../lib/badge-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { MedicalSubmission } from '../types/api';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from './ui/alert';

export function AssignedToMe() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssignedSubmissions();
  }, []);

  const loadAssignedSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await submissionsApi.getAssignedToMe();
      setSubmissions(data);
    } catch (err: any) {
      console.error('Failed to load assigned submissions:', err);
      setError(err?.message || 'Failed to load assigned submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await submissionsApi.claimSubmission(id);
      // Navigate to draft editor after claiming
      navigate(`/draft/${id}`);
    } catch (err: any) {
      console.error('Failed to claim submission:', err);
      alert(err?.message || 'Failed to claim submission');
    } finally {
      setClaimingId(null);
    }
  };

  const handleView = (id: string) => {
    // Just navigate to draft editor without claiming (silent)
    navigate(`/draft/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Assigned to Me
          </h2>
          <p className="text-muted-foreground mt-1">
            Collaborative drafts assigned to you. Click <strong>Open</strong> to view/edit, or <strong>Claim</strong> to acknowledge and start working.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAssignedSubmissions}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">
              In Progress Submissions ({submissions.length})
            </Label>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                No submissions assigned to you
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                When colleagues assign submissions to you, they'll appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Patient / Exam Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {getDisplayName(
                              submission.patientName,
                              submission.examType,
                              submission.status
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {submission.examType.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getSubmissionStatusBadgeVariant(submission.status)}
                        >
                          {getSubmissionStatusLabel(submission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {submission.assignedByName || 'Unknown'}
                          </div>
                          {submission.assignedByRole && (
                            <div className="text-xs text-muted-foreground capitalize">
                              {submission.assignedByRole}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {submission.assignedAt
                            ? formatDistanceToNow(new Date(submission.assignedAt), {
                                addSuffix: true,
                              })
                            : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(submission.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClaim(submission.id)}
                            disabled={claimingId === submission.id}
                          >
                            {claimingId === submission.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Claim
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
