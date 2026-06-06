const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, LogOut, User, Globe } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    currency: 'USD',
    country: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        currency: user.currency || 'USD',
        country: user.country || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await db.auth.updateMe(form);
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    setSaving(false);
  };

  const handleLogout = () => {
    db.auth.logout('/login');
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Profile */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold">{user?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input
            placeholder="+1 234 567 890"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="BDT">BDT (৳)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="CAD">CAD ($)</SelectItem>
              <SelectItem value="AUD">AUD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input
            placeholder="Your country"
            value={form.country}
            onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
            className="rounded-xl"
          />
        </div>

        <Button onClick={handleSave} className="w-full rounded-xl" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>

      {/* Logout */}
      <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl gap-2 text-destructive hover:text-destructive">
        <LogOut className="w-4 h-4" /> Sign Out
      </Button>
    </div>
  );
}