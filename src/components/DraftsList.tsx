import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useMockData } from './useMockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { FileEdit, Search, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner@2.0.3';

export function DraftsList() {
  const { user } = useAuth();
  const { drafts, deleteDraft } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const myDrafts = user?.role === 'admin'
    ? drafts
    : drafts.filter(d => d.createdBy === user?.id);

  const filteredDrafts = myDrafts.filter(draft => 
    draft.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.patientNric.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteDraft(deleteId);
      toast.success('Draft deleted successfully');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Drafts</h2>
        <p className="text-slate-600">Resume editing your saved medical exam drafts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Drafts</CardTitle>
          <CardDescription>Find your saved drafts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by patient name or NRIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Drafts ({filteredDrafts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
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
                    <TableHead>Patient Name</TableHead>
                    <TableHead>NRIC/FIN</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell>{draft.patientName}</TableCell>
                      <TableCell className="text-slate-600">{draft.patientNric}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {draft.examType.includes('Migrant') && 'MDW Six-monthly (MOM)'}
                          {draft.examType.includes('Work Permit') && 'Work Permit (MOM)'}
                          {draft.examType.includes('Aged Drivers') && 'Aged Drivers (SPF)'}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{draft.createdByName}</TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(draft.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/draft/${draft.id}`}>
                            <Button variant="ghost" size="sm">Continue</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(draft.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
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
