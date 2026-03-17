import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, User, Mail, Phone, Building2, LogOut } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
      setCompanyName(profile.company_name || '');
    }
  }, [profile]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        phone,
        company_name: companyName,
      }).eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
              <Input value={user.email || ''} disabled className="h-9 bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><User className="w-3 h-3" /> Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-9" placeholder="Your name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9" placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Building2 className="w-3 h-3" /> Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-9" placeholder="Your company" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 btn-3d">
                <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button variant="destructive" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
