import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { submissionsApi } from '../services';
import type { MedicalSubmission } from '../services';
import { formatExamType } from '../lib/formatters';
import { getDisplayName } from '../lib/nameDisplay';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Edit, FileEdit, Search, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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

// Helper to check if a draft has pending memos
const hasPendingMemos = (draft: MedicalSubmission): boolean => {
  if (draft.examType !== 'DRIVING_VOCATIONAL_TP_LTA') return false;
  
  const formData = draft.formData as Record<string, any>;
  const memoRequirements = formData.memoRequirements 
    ? (typeof formData.memoRequirements === 'string' 
        ? JSON.parse(formData.memoRequirements) 
        : formData.memoRequirements)
    : {};
  
  const checkedConditions = Object.entries(memoRequirements)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);
  
  for (const conditionId of checkedConditions) {
    const memoProvided = formData[`memoProvided_${conditionId}`];
    const furtherMemoRequired = formData[`furtherMemoRequired_${conditionId}`];
    
    if (memoProvided === 'no' || (memoProvided === 'yes' && furtherMemoRequired === 'yes')) {
      return true;
    }
  }
  
  return false;
};

export function DraftsList() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<MedicalSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [filterMemoStatus, setFilterMemoStatus] = useState<'all' | 'pending' | 'complete'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [includeDeleted] = useState(false);
  const [sortField, setSortField] = useState<keyof MedicalSubmission | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setIsLoading(true);
        const response = await submissionsApi.getDrafts({ 
          page: 1, 
          limit: 100,
          includeDeleted: user?.role === 'admin' ? includeDeleted : false
        });
        setDrafts(response.data);
      } catch (error) {
        console.error('Failed to fetch drafts:', error);
        toast.error('Failed to load drafts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, [user?.role, includeDeleted]);

  const getSortIcon = (column: string) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = 
      draft.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.patientNric.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExamType = filterExamType === 'all' || draft.examType === filterExamType;
    
    const pendingMemo = hasPendingMemos(draft);
    const matchesMemoStatus = 
      filterMemoStatus === 'all' ||
      (filterMemoStatus === 'pending' && pendingMemo) ||
      (filterMemoStatus === 'complete' && !pendingMemo);
    
    return matchesSearch && matchesExamType && matchesMemoStatus;
  });

  const handleSort = (field: keyof MedicalSubmission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedDrafts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedDrafts = sortedDrafts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterExamType, filterMemoStatus]);

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await submissionsApi.delete(deleteId);
        setDrafts(drafts.filter(d => d.id !== deleteId));
        toast.success('Draft deleted successfully');
        setDeleteId(null);
      } catch (error) {
        console.error('Failed to delete draft:', error);
        toast.error('Failed to delete draft');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1 text-2xl font-semibold">Draft Reports</h2>
        <p className="text-slate-600">Resume editing your saved medical examination drafts</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {/* Memo Status Filter Tabs */}
          <div className="mt-6 flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setFilterMemoStatus('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterMemoStatus === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Drafts ({drafts.length})
            </button>
            <button
              onClick={() => setFilterMemoStatus('pending')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterMemoStatus === 'pending'
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Memo/Report ({drafts.filter(hasPendingMemos).length})
            </button>
            <button
              onClick={() => setFilterMemoStatus('complete')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterMemoStatus === 'complete'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No Pending Memo ({drafts.filter(d => !hasPendingMemos(d)).length})
            </button>
          </div>

          {/* Search and Exam Type Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="my-4">
            <Label className="text-base font-semibold">Drafts ({sortedDrafts.length})</Label>
          </div>
          {sortedDrafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileEdit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No drafts found</p>
              {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
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
                      onClick={() => handleSort('patientNric')}
                    >
                      NRIC/FIN{getSortIcon('patientNric')}
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
                      Created By{getSortIcon('createdByName')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 select-none"
                      onClick={() => handleSort('createdDate')}
                    >
                      Last Modified{getSortIcon('createdDate')}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDrafts.map((draft) => {
                    const isDeleted = !!draft.deletedAt;
                    const pendingMemo = hasPendingMemos(draft);
                    return (
                      <TableRow 
                        key={draft.id} 
                        className={isDeleted ? 'bg-red-50 opacity-60' : pendingMemo ? 'bg-yellow-50' : ''}
                      >
                        <TableCell>
                          {getDisplayName(draft.patientName, draft.examType, draft.status)}
                          {isDeleted && (
                            <span className="ml-2 text-xs text-red-600 font-medium">(Deleted)</span>
                          )}
                          {!isDeleted && pendingMemo && (
                            <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-medium">
                              Pending Memo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">{draft.patientNric}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatExamType(draft.examType)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {draft.createdByName || draft.createdBy}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {isDeleted && draft.deletedAt
                            ? `Deleted: ${new Date(draft.deletedAt).toLocaleDateString()}`
                            : new Date(draft.createdDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!isDeleted ? (
                            <div className="flex items-center gap-2">
                              <Link to={`/draft/${draft.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4 mr-1.5" />
                                  Continue
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(draft.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Delete
                              </Button>
                            </div>
                          ) : user?.role === 'admin' ? (
                            <Link to={`/view-submission/${draft.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                              >
                                <Edit className="w-4 h-4 mr-1.5" />
                                View
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500 italic">No actions available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedDrafts.length)} of {sortedDrafts.length} drafts
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
