import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Users, Settings, FileText, Shield, Search, CreditCard } from 'lucide-react';
import AdminPricingManager from '@/components/AdminPricingManager';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

interface SiteSetting {
  id: string;
  key: string;
  value: any;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin')
      .then(({ data }) => setIsAdmin(data && data.length > 0));
  }, [user]);

  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    // Load all profiles
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setUsers(data); });
    // Load settings
    supabase.from('site_settings').select('*')
      .then(({ data }) => { if (data) setSettings(data); });
    // Counts
    supabase.from('saved_invoices').select('id', { count: 'exact', head: true })
      .then(({ count }) => setInvoiceCount(count || 0));
    supabase.from('saved_tickets').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTicketCount(count || 0));
  }, [isAdmin]);

  const updateSetting = async (key: string, value: any) => {
    const { error } = await supabase.from('site_settings').update({ value, updated_by: user!.id }).eq('key', key);
    if (error) toast.error('Failed to update');
    else {
      toast.success('Setting updated!');
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    }
  };

  const getSettingValue = (key: string) => {
    const s = settings.find(s => s.key === key);
    return s ? (typeof s.value === 'string' ? s.value : JSON.stringify(s.value)) : '';
  };

  const makeAdmin = async (userId: string) => {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' as any });
    if (error) toast.error(error.message);
    else toast.success('Admin role granted!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold gradient-text">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="stat-card"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></div>
          <div className="stat-card"><p className="text-sm text-muted-foreground">Invoices</p><p className="text-2xl font-bold">{invoiceCount}</p></div>
          <div className="stat-card"><p className="text-sm text-muted-foreground">Tickets</p><p className="text-2xl font-bold">{ticketCount}</p></div>
          <div className="stat-card"><p className="text-sm text-muted-foreground">Save Days</p><p className="text-2xl font-bold">{getSettingValue('invoice_save_days')}</p></div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="gap-1"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1"><Settings className="w-4 h-4" /> Site Settings</TabsTrigger>
            <TabsTrigger value="pricing" className="gap-1"><CreditCard className="w-4 h-4" /> Pricing</TabsTrigger>
            <TabsTrigger value="seo" className="gap-1"><FileText className="w-4 h-4" /> SEO & Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Company</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.user_id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3 font-medium">{u.full_name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3 text-muted-foreground">{u.phone || '—'}</td>
                      <td className="p-3 text-muted-foreground">{u.company_name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Button size="sm" variant="outline" onClick={() => makeAdmin(u.user_id)}>Make Admin</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Invoice Save Duration</h3>
              <div className="flex items-center gap-3">
                <Label className="text-sm text-muted-foreground">Normal users: save for</Label>
                <Input type="number" value={getSettingValue('invoice_save_days')} className="w-24"
                  onChange={e => updateSetting('invoice_save_days', Number(e.target.value))} />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">Admin accounts always save permanently.</p>
            </div>

            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Site Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Site Name</Label>
                  <Input value={getSettingValue('site_name').replace(/"/g, '')}
                    onChange={e => updateSetting('site_name', `"${e.target.value}"`)} />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Site Description</Label>
                  <Input value={getSettingValue('site_description').replace(/"/g, '')}
                    onChange={e => updateSetting('site_description', `"${e.target.value}"`)} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Google AdSense</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-sm">Enable Ads</Label>
                  <input type="checkbox" checked={getSettingValue('adsense_enabled') === 'true'}
                    onChange={e => updateSetting('adsense_enabled', e.target.checked)}
                    className="rounded" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">AdSense Publisher Code (ca-pub-xxxxx)</Label>
                  <Input value={getSettingValue('adsense_code').replace(/"/g, '')} placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                    onChange={e => updateSetting('adsense_code', `"${e.target.value}"`)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add your Google AdSense publisher code here. Ads will appear on the website after Google approves your site.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">SEO Pages</h3>
              <p className="text-sm text-muted-foreground">
                The following SEO pages are auto-generated: Privacy Policy, Terms of Service, Refund Policy, Contact, Sitemap.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/privacy"><Button variant="outline" size="sm">Privacy Policy</Button></Link>
                <Link to="/terms"><Button variant="outline" size="sm">Terms of Service</Button></Link>
                <Link to="/refund"><Button variant="outline" size="sm">Refund Policy</Button></Link>
                <Link to="/contact"><Button variant="outline" size="sm">Contact</Button></Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
