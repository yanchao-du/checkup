import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Eye, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ExamTypeFilter } from './ExamTypeFilter';
import { getSubmissionStatusBadgeVariant, getSubmissionStatusLabel } from '../lib/badge-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function SubmissionsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const rowsPerPage = 10;

  const isDoctor = user?.role === 'doctor';

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const response = await submissionsApi.getAll();
        setSubmissions(response.data);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Backend already filters by createdBy OR approvedBy for doctors
  // So we don't need to filter again on the frontend
  const mySubmissions = submissions;

  const filteredSubmissions = mySubmissions.filter((submission: any) => {
    const matchesSearch = 
      submission.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesExamType = filterExamType === 'all' || submission.examType === filterExamType;

    // For doctors, only show submitted status (exclude pending_approval and rejected)
    const matchesRole = !isDoctor || submission.status === 'submitted';

    return matchesSearch && matchesStatus && matchesExamType && matchesRole;
  });

  // Sort the filtered submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a: any, b: any) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'patientName':
        aValue = a.patientName.toLowerCase();
        bValue = b.patientName.toLowerCase();
        break;
      case 'nric':
        aValue = a.patientNric.toLowerCase();
        bValue = b.patientNric.toLowerCase();
        break;
      case 'examType':
        aValue = a.examType;
        bValue = b.examType;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdBy':
        aValue = a.createdByName.toLowerCase();
        bValue = b.createdByName.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.submittedDate || a.createdDate).getTime();
        bValue = new Date(b.submittedDate || b.createdDate).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSubmissions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [searchQuery, filterStatus, filterExamType]);

  // Sync pageInput with currentPage when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Medical Examinations</h2>
        <p className="text-slate-600">View and search all submitted medical examinations</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* <Label className="text-base font-semibold">Search and filter your completed submissions</Label> */}
          {isDoctor ? (
            // Doctor layout: Search and Exam Type side by side
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                  placeholder="Search by patient name or NRIC/FIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2">
                <ExamTypeFilter value={filterExamType} onValueChange={setFilterExamType} />
              </div>
            </div>
          ) : (
            // Non-doctor layout: Search full width, then filters below
            <>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by patient name or NRIC/FIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* <label className="text-sm text-slate-700">Status</label> */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {/* <label className="text-sm text-slate-700">Exam Type</label> */}
              <ExamTypeFilter value={filterExamType} onValueChange={setFilterExamType} />
            </div>
          </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="my-4">
            <Label className="text-base font-semibold">Results ({sortedSubmissions.length})</Label>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading submissions...</p>
            </div>
          ) : sortedSubmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No submissions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
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
                      onClick={() => handleSort('nric')}
                    >
                      NRIC/FIN{getSortIcon('nric')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('examType')}
                    >
                      Examination Type{getSortIcon('examType')}
                    </TableHead>
                    {!isDoctor && (
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-50 select-none"
                        onClick={() => handleSort('status')}
                      >
                        Status{getSortIcon('status')}
                      </TableHead>
                    )}
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('createdBy')}
                    >
                      Created By{getSortIcon('createdBy')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('date')}
                    >
                      Date{getSortIcon('date')}
                    </TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((submission: any) => (
                    <TableRow 
                      key={submission.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/view-submission/${submission.id}`, { state: { from: '/submissions' } })}
                    >
                      <TableCell>{getDisplayName(submission.patientName, submission.examType, submission.status)}</TableCell>
                      <TableCell className="text-slate-600">{submission.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {submission.examType === 'SIX_MONTHLY_MDW' && 'MDW Six-monthly (MOM)'}
                          {submission.examType === 'SIX_MONTHLY_FMW' && 'FMW Six-monthly (MOM)'}
                          {submission.examType === 'WORK_PERMIT' && 'Work Permit (MOM)'}
                          {submission.examType === 'AGED_DRIVERS' && 'Aged Drivers (SPF)'}
                          {submission.examType === 'DRIVING_LICENCE_TP' && 'Driving Licence (TP)'}
                          {submission.examType === 'DRIVING_VOCATIONAL_TP_LTA' && 'Driving Vocational (TP/LTA)'}
                          {submission.examType === 'VOCATIONAL_LICENCE_LTA' && 'Vocational Licence (LTA)'}
                          {submission.examType === 'PR_MEDICAL' && 'PR Medical (ICA)'}
                          {submission.examType === 'STUDENT_PASS_MEDICAL' && 'Student Pass (ICA)'}
                          {submission.examType === 'LTVP_MEDICAL' && 'LTVP (ICA)'}
                        </div>
                      </TableCell>
                      {!isDoctor && (
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              variant={getSubmissionStatusBadgeVariant(submission.status)}
                            >
                              {getSubmissionStatusLabel(submission.status)}
                            </Badge>
                            {submission.status === 'in_progress' && submission.assignedToName && (
                              <div className="text-xs text-slate-600">
                                Assigned to: {submission.assignedToName} ({submission.assignedToRole})
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-slate-600">{submission.createdByName}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/view-submission/${submission.id}`} state={{ from: '/submissions' }}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedSubmissions.length)} of {sortedSubmissions.length} submissions
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
    </div>
  );
}
