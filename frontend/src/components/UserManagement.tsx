import { useState, useEffect } from 'react';
import { usersApi } from '../services/users.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2 } from 'lucide-react';
import { ClinicUser, UserRole } from '../types/api';
import { getUserStatusBadgeVariant, getUserStatusLabel } from '../lib/badge-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Users, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState<ClinicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<ClinicUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'nurse' as UserRole,
    mcrNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'nurse', mcrNumber: '' });
    setShowDialog(true);
  };

  const handleEditUser = (user: ClinicUser) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role,
      mcrNumber: user.mcrNumber || '',
    });
    setShowDialog(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast.warning('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.warning('Please enter a valid email address');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.warning('Password is required for new users');
      return;
    }

    // Validate MCR number for doctors
    if (formData.role === 'doctor' && formData.mcrNumber) {
      const mcrRegex = /^[A-Z]\d{5}[A-Z]$/;
      if (!mcrRegex.test(formData.mcrNumber)) {
        toast.warning('MCR number must be in format: Letter + 5 digits + Letter (e.g., M12345A)');
        return;
      }
    }

    try {
      setIsSaving(true);
      
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        if (formData.role === 'doctor') {
          updateData.mcrNumber = formData.mcrNumber || null;
        }
        
        await usersApi.update(editingUser.id, updateData);
        toast.success('User updated successfully');
      } else {
        const createData: any = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        
        if (formData.role === 'doctor' && formData.mcrNumber) {
          createData.mcrNumber = formData.mcrNumber;
        }
        
        await usersApi.create(createData);
        toast.success('User added successfully');
      }
      
      setShowDialog(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersApi.delete(userId);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1 text-2xl font-semibold">User Management</h2>
          <p className="text-slate-600">Manage clinic staff access and permissions</p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Total Users</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{users.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active clinic staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Doctors</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              {users.filter(u => u.role === 'doctor').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Can approve submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-600">Nurses</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              {users.filter(u => u.role === 'nurse').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Can create submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinic Staff</CardTitle>
          <CardDescription>Manage user roles and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table role="table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>MCR Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-mono">
                        {user.role === 'doctor' ? (user.mcrNumber || '-') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getUserStatusBadgeVariant(user.status)}
                        >
                          {getUserStatusLabel(user.status)}
                        </Badge>
                      </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Update user information and permissions' 
                : 'Add a new staff member to your clinic'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@clinic.sg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {editingUser && '(leave blank to keep current)'}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role" data-testid="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor" data-testid="role-option-doctor">Doctor</SelectItem>
                  <SelectItem value="nurse" data-testid="role-option-nurse">Nurse</SelectItem>
                  <SelectItem value="admin" data-testid="role-option-admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {formData.role === 'doctor' && 'Can create, approve and submit medical exams'}
                {formData.role === 'nurse' && 'Can create medical exams and route for approval'}
                {formData.role === 'admin' && 'Can manage users and view all clinic submissions'}
              </p>
            </div>
            
            {formData.role === 'doctor' && (
              <div className="space-y-2">
                <Label htmlFor="mcrNumber">MCR Number (Optional)</Label>
                <Input
                  id="mcrNumber"
                  name="mcrNumber"
                  value={formData.mcrNumber}
                  onChange={(e) => setFormData({ ...formData, mcrNumber: e.target.value.toUpperCase() })}
                  placeholder="M12345A"
                  maxLength={7}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format: Letter + 5 digits + Letter (e.g., M12345A)
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingUser ? 'Save' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
