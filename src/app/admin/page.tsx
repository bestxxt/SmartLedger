"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader } from "lucide-react";

const TAG_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showDialog, setShowDialog] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [tagAddOpen, setTagAddOpen] = useState(false);
  const [tagAddInput, setTagAddInput] = useState('');
  const [locationAddOpen, setLocationAddOpen] = useState(false);
  const [locationAddInput, setLocationAddInput] = useState('');

  // 获取所有用户
  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    } else {
      toast.error("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 编辑用户
  const handleEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      tags: user.tags || [],
      locations: user.locations || [],
    });
    setShowDialog(true);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editUser._id, ...editForm }),
    });
    if (res.ok) {
      toast.success("User updated");
      setShowDialog(false);
      fetchUsers();
    } else {
      toast.error("Failed to update user");
    }
  };

  // 删除用户
  const handleDelete = async (user: any) => {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user._id }),
    });
    if (res.ok) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error("Failed to delete user");
    }
  };

  // 头像上传
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((f: any) => ({ ...f, avatar: reader.result }));
      setAvatarLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // tag 批量添加
  const handleAddTags = () => {
    const names = tagAddInput.split(',').map(s => s.trim()).filter(Boolean);
    if (names.length) {
      setEditForm((f: any) => ({
        ...f,
        tags: [
          ...(f.tags || []),
          ...names.map(name => ({
            id: `tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name,
            color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value
          }))
        ]
      }));
    }
    setTagAddInput('');
    setTagAddOpen(false);
  };
  // location 批量添加
  const handleAddLocations = () => {
    const names = locationAddInput.split(',').map(s => s.trim()).filter(Boolean);
    if (names.length) {
      setEditForm((f: any) => ({
        ...f,
        locations: [
          ...(f.locations || []),
          ...names.map(name => ({
            id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name
          }))
        ]
      }));
    }
    setLocationAddInput('');
    setLocationAddOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin - User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">No users found</TableCell>
            </TableRow>
          ) : users.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Edit</Button>
                <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(user)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* 头像 */}
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group border" onClick={() => fileInputRef.current?.click()}>
                {avatarLoading ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Loader className="w-6 h-6 animate-spin" /></div>
                ) : editForm.avatar ? (
                  <img src={editForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Upload className="w-6 h-6" /></div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Upload className="w-4 h-4 text-white" /></div>
              </div>
            </div>
            {/* 名字 */}
            <Label>Name</Label>
            <Input value={editForm.name || ''} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Name" />
            {/* tag 管理 */}
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editForm.tags || []).map((tag: any, idx: number) => (
                <span key={tag.id || idx} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border" style={{ background: tag.color ? `${tag.color}20` : undefined, color: tag.color }}>{tag.name}
                  <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => setEditForm((f: any) => ({ ...f, tags: (f.tags || []).filter((t: any, i: number) => i !== idx) }))}>×</button>
                </span>
              ))}
              <button type="button" className="px-2 py-1 rounded-full border text-xs" onClick={() => setTagAddOpen(!tagAddOpen)}><Plus className="w-3 h-3 inline" /> Add</button>
            </div>
            {tagAddOpen && (
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagAddInput}
                  onChange={e => setTagAddInput(e.target.value)}
                  placeholder="e.g. Food,Travel,Gift"
                  className="flex-grow"
                />
                <Button size="sm" onClick={handleAddTags} disabled={!tagAddInput.trim()}>Add Tag(s)</Button>
              </div>
            )}
            {/* location 管理 */}
            <Label>Locations</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editForm.locations || []).map((loc: any, idx: number) => (
                <span key={loc.id || idx} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border">
                  {loc.name}
                  <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => setEditForm((f: any) => ({ ...f, locations: (f.locations || []).filter((l: any, i: number) => i !== idx) }))}>×</button>
                </span>
              ))}
              <button type="button" className="px-2 py-1 rounded-full border text-xs" onClick={() => setLocationAddOpen(!locationAddOpen)}><Plus className="w-3 h-3 inline" /> Add</button>
            </div>
            {locationAddOpen && (
              <div className="flex gap-2 mb-2">
                <Input
                  value={locationAddInput}
                  onChange={e => setLocationAddInput(e.target.value)}
                  placeholder="e.g. Home,Work,School"
                  className="flex-grow"
                />
                <Button size="sm" onClick={handleAddLocations} disabled={!locationAddInput.trim()}>Add Location(s)</Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave}>Save</Button>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 