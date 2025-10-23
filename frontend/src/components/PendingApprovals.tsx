import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

export function PendingApprovals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<MedicalSubmission | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setIsLoading(true);
        const response = await approvalsApi.getPending({ page: 1, limit: 100 });
        setPendingApprovals(response.data);
      } catch (error) {
        console.error('Failed to fetch pending approvals:', error);
        toast.error('Failed to load pending approvals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;

    try {
      setIsApproving(true);
      await approvalsApi.approve(selectedSubmission.id, {
        notes: 'Approved by doctor'
      });
      
      // Remove from pending list
      setPendingApprovals(pendingApprovals.filter(s => s.id !== selectedSubmission.id));
      toast.success('Medical exam approved and submitted successfully');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to approve submission:', error);
      toast.error('Failed to approve submission');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !user) return;

    try {
      setIsApproving(true);
      await approvalsApi.reject(selectedSubmission.id, {
        reason: 'Requires corrections'
      });
      
      // Remove from pending list
      setPendingApprovals(pendingApprovals.filter(s => s.id !== selectedSubmission.id));
      toast.success('Medical exam rejected and returned to drafts');
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Failed to reject submission:', error);
      toast.error('Failed to reject submission');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Pending Approvals</h2>
        <p className="text-slate-600">Review and approve medical exam submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions Awaiting Approval ({pendingApprovals.length})</CardTitle>
          <CardDescription>Review medical exams before submission to government agencies</CardDescription>
        </CardHeader>
        <CardContent data-testid="approvals-list">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No pending approvals</p>
              <p className="text-sm mt-1">All submissions have been reviewed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table role="table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>NRIC/FIN</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((submission) => (
                    <TableRow 
                      key={submission.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/view-submission/${submission.id}`)}
                    >
                      <TableCell>{submission.patientName}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {submission.examType.includes('Migrant') && 'MDW Six-monthly (MOM)'}
                          {submission.examType.includes('Work Permit') && 'Work Permit (MOM)'}
                          {submission.examType.includes('Aged Drivers') && 'Aged Drivers (SPF)'}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{submission.createdBy}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(submission.createdDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link to={`/view-submission/${submission.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setIsApproving(true);
                              setSelectedSubmission(submission);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setIsApproving(false);
                              setSelectedSubmission(submission);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
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

      <AlertDialog open={selectedSubmission !== null} onOpenChange={() => setSelectedSubmission(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isApproving ? 'Approve Medical Exam?' : 'Reject Medical Exam?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isApproving ? (
                <>
                  You are about to approve and submit the medical exam for <strong>{selectedSubmission?.patientName}</strong> to the relevant government agency.
                  <br /><br />
                  This action will officially submit the results and cannot be undone.
                </>
              ) : (
                <>
                  You are about to reject the medical exam for <strong>{selectedSubmission?.patientName}</strong>.
                  <br /><br />
                  This will return the submission to drafts for revision.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={isApproving ? handleApprove : handleReject}
              className={isApproving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isApproving ? 'Approve & Submit' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
