import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { approvalsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { CheckCircle, Eye, Clock, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const rowsPerPage = 10;

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

  const getSortIcon = (column: string) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = 
      approval.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (approval.patientNric && approval.patientNric.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (approval.patientPassportNo && approval.patientPassportNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

  // Pagination
  const totalPages = Math.ceil(sortedApprovals.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedApprovals = sortedApprovals.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [searchQuery, filterExamType]);

  // Sync pageInput with currentPage when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;

    try {
      setIsApproving(true);
      await approvalsApi.approve(selectedSubmission.id, {
        notes: 'Approved by doctor'
      });
      
      // Remove from pending list
      setPendingApprovals(pendingApprovals.filter(s => s.id !== selectedSubmission.id));
      toast.success('Medical examination approved and submitted successfully');
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
      toast.success('Medical examination rejected and returned to drafts');
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
        <p className="text-slate-600">Review and approve medical examination submissions</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* <Label className="text-base font-semibold">Search Pending Approvals</Label> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, NRIC/FIN, or passport..."
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
            <Label className="text-base font-semibold">Reports Awaiting Approval ({sortedApprovals.length})</Label>
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
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('patientName')}
                    >
                      Patient Name{getSortIcon('patientName')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('patientNric')}
                    >
                      NRIC/FIN{getSortIcon('patientNric')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('patientPassportNo')}
                    >
                      Passport{getSortIcon('patientPassportNo')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('examType')}
                    >
                      Examination Type{getSortIcon('examType')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('createdByName')}
                    >
                      Submitted By{getSortIcon('createdByName')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('createdDate')}
                    >
                      Date Submitted{getSortIcon('createdDate')}
                    </TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApprovals.map((submission) => (
                    <TableRow 
                      key={submission.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/view-submission/${submission.id}`, { state: { from: '/pending-approvals' } })}
                    >
                      <TableCell>{getDisplayName(submission.patientName, submission.examType, submission.status)}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric || '-'}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientPassportNo || '-'}</TableCell>
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedApprovals.length)} of {sortedApprovals.length} approvals
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Page</span>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPageInput(value);
                          const page = parseInt(value);
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }}
                        onBlur={() => {
                          // Reset to current page if input is invalid
                          setPageInput(currentPage.toString());
                        }}
                        className="w-16 h-8 text-center"
                      />
                      <span className="text-sm text-slate-600">of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={selectedSubmission !== null} onOpenChange={() => setSelectedSubmission(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isApproving ? 'Approve Medical Examination?' : 'Reject Medical Examination?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isApproving ? (
                <>
                  You are about to approve and submit the medical examination for <strong>{getDisplayName(selectedSubmission?.patientName || '', selectedSubmission?.examType || '', selectedSubmission?.status)}</strong> to the relevant government agency.
                  <br /><br />
                  This action will officially submit the results and cannot be undone.
                </>
              ) : (
                <>
                  You are about to reject the medical examination for <strong>{getDisplayName(selectedSubmission?.patientName || '', selectedSubmission?.examType || '', selectedSubmission?.status)}</strong>.
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
