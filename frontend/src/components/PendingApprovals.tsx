import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { CheckCircle, Eye, Clock, Search, ArrowUpDown } from 'lucide-react';
import { ExamTypeFilter } from './ExamTypeFilter';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<MedicalSubmission | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [sortField, setSortField] = useState<keyof MedicalSubmission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = 
      approval.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExamType = filterExamType === 'all' || approval.examType === filterExamType;
    
    return matchesSearch && matchesExamType;
  });

  const handleSort = (field: keyof MedicalSubmission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

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
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Pending Approvals</h2>
        <p className="text-slate-600">Review and approve medical exam submissions</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* <Label className="text-base font-semibold">Search Pending Approvals</Label> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or NRIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <ExamTypeFilter value={filterExamType} onValueChange={setFilterExamType} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="my-4">
            <Label className="text-base font-semibold">Submissions Awaiting Approval ({sortedApprovals.length})</Label>
          </div>
          {sortedApprovals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No pending approvals found</p>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
              {!searchQuery && <p className="text-sm mt-1">All submissions have been reviewed</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table role="table">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('patientName')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Patient Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('patientNric')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        NRIC/FIN
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('examType')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Exam Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('createdByName')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Submitted By
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('createdDate')}
                        className="h-8 px-2 hover:bg-slate-100 font-semibold"
                      >
                        Date Submitted
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApprovals.map((submission) => (
                    <TableRow 
                      key={submission.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/view-submission/${submission.id}`, { state: { from: '/pending-approvals' } })}
                    >
                      <TableCell>{submission.patientName}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatExamType(submission.examType)}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {submission.createdByName || submission.createdBy}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(submission.createdDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link to={`/view-submission/${submission.id}`} state={{ from: '/pending-approvals' }}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Review
                            </Button>
                          </Link>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setIsApproving(true);
                              setSelectedSubmission(submission);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Approve
                          </Button> */}
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setIsApproving(false);
                              setSelectedSubmission(submission);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Reject
                          </Button> */}
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
