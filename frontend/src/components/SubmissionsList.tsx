import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submissionsApi } from '../services/submissions.service';
import { getDisplayName } from '../lib/nameDisplay';
import { formatExamType } from '../lib/formatters';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Eye, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const rowsPerPage = 10;

  const isDoctor = user?.role === 'doctor';

  const handleDownloadPdf = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      setDownloadingId(submissionId);
      const blob = await submissionsApi.downloadPdf(submissionId);

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission-${submissionId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

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
        const response = await submissionsApi.getAll({ limit: 100 });
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
      (submission.patientNric && submission.patientNric.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (submission.patientPassportNo && submission.patientPassportNo.toLowerCase().includes(searchQuery.toLowerCase()));

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
        aValue = (a.patientNric || a.patientPassportNo || '').toLowerCase();
        bValue = (b.patientNric || b.patientPassportNo || '').toLowerCase();
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
                  placeholder="Search name, NRIC/FIN, or passport..."
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
                  placeholder="Search name, NRIC/FIN, or passport..."
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
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 mb-4">
                {paginatedSubmissions.map((submission: any) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{submission.patientName}</h3>
                        <p className="text-sm text-slate-500">
                          {submission.patientNric || submission.patientPassportNo || '-'}
                        </p>
                      </div>
                      {!isDoctor && (
                        <Badge variant={getSubmissionStatusBadgeVariant(submission.status)}>
                          {getSubmissionStatusLabel(submission.status)}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Exam:</span>
                        <span className="font-medium text-right">{formatExamType(submission.examType)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created By:</span>
                        <span>{submission.createdByName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date:</span>
                        <span>{new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <Link to={`/view-submission/${submission.id}`} state={{ from: '/submissions' }} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                      </Link>
                      {submission.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDownloadPdf(submission.id, e)}
                          disabled={downloadingId === submission.id}
                          className="flex-1 text-slate-600"
                        >
                          {downloadingId === submission.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              PDF
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1.5" />
                              PDF
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
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
                        <TableCell className="text-slate-600">{submission.patientNric || '-'}</TableCell>
                        <TableCell className="text-slate-600">{submission.patientPassportNo || '-'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatExamType(submission.examType)}
                          </div>
                        </TableCell>
                        {!isDoctor && (
                          <TableCell>
                            <Badge
                              variant={getSubmissionStatusBadgeVariant(submission.status)}
                            >
                              {getSubmissionStatusLabel(submission.status)}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-slate-600">{submission.createdByName}</TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(submission.submittedDate || submission.createdDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                            {submission.status === 'submitted' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDownloadPdf(submission.id, e)}
                                disabled={downloadingId === submission.id}
                                className="text-slate-600"
                              >
                                {downloadingId === submission.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4 sm:gap-0">
                  <div className="text-sm text-slate-600 text-center sm:text-left">
                    <span className="hidden sm:inline">Showing {startIndex + 1}-{Math.min(endIndex, sortedSubmissions.length)} of {sortedSubmissions.length} submissions</span>
                    <span className="sm:hidden">{startIndex + 1}-{Math.min(endIndex, sortedSubmissions.length)} of {sortedSubmissions.length}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="First page"
                      className="hidden sm:inline-flex"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">Page</span>
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
                        className="w-12 sm:w-16 h-8 text-center text-sm"
                      />
                      <span className="text-xs sm:text-sm text-slate-600">of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last page"
                      className="hidden sm:inline-flex"
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
