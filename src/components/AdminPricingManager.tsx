import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, X, Star } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
  sort_order: number;
  is_active: boolean;
}

export default function AdminPricingManager() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingPlan>>({});
  const [adding, setAdding] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: 0, period: '/month', features: '', popular: false, sort_order: 0 });

  const loadPlans = async () => {
    const { data } = await supabase.from('pricing_plans').select('*').order('sort_order');
    if (data) setPlans(data.map(p => ({ ...p, features: (p.features as any) || [] })));
  };

  useEffect(() => { loadPlans(); }, []);

  const startEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setEditForm({ ...plan });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('pricing_plans').update({
      name: editForm.name,
      price: editForm.price,
      period: editForm.period,
      features: editForm.features as any,
      popular: editForm.popular,
      sort_order: editForm.sort_order,
      is_active: editForm.is_active,
    }).eq('id', editingId);
    if (error) toast.error(error.message);
    else { toast.success('Plan updated!'); cancelEdit(); loadPlans(); }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    const { error } = await supabase.from('pricing_plans').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Plan deleted!'); loadPlans(); }
  };

  const addPlan = async () => {
    const features = newPlan.features.split(',').map(f => f.trim()).filter(Boolean);
    const { error } = await supabase.from('pricing_plans').insert({
      name: newPlan.name,
      price: newPlan.price,
      period: newPlan.period,
      features: features as any,
      popular: newPlan.popular,
      sort_order: newPlan.sort_order,
    });
    if (error) toast.error(error.message);
    else { toast.success('Plan added!'); setAdding(false); setNewPlan({ name: '', price: 0, period: '/month', features: '', popular: false, sort_order: 0 }); loadPlans(); }
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(editForm.features || [])];
    features[index] = value;
    setEditForm({ ...editForm, features });
  };

  const addFeature = () => setEditForm({ ...editForm, features: [...(editForm.features || []), ''] });
  const removeFeature = (index: number) => setEditForm({ ...editForm, features: (editForm.features || []).filter((_, i) => i !== index) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Pricing Plans</h3>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus className="w-4 h-4 mr-1" /> Add Plan</Button>
      </div>

      {adding && (
        <div className="glass-panel rounded-xl p-4 space-y-3 border border-primary/30">
          <h4 className="font-medium">New Plan</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} /></div>
            <div><Label className="text-xs text-muted-foreground">Price (₹)</Label><Input type="number" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} /></div>
            <div><Label className="text-xs text-muted-foreground">Period</Label><Input value={newPlan.period} onChange={e => setNewPlan({ ...newPlan, period: e.target.value })} /></div>
            <div><Label className="text-xs text-muted-foreground">Sort Order</Label><Input type="number" value={newPlan.sort_order} onChange={e => setNewPlan({ ...newPlan, sort_order: Number(e.target.value) })} /></div>
          </div>
          <div><Label className="text-xs text-muted-foreground">Features (comma separated)</Label><Input value={newPlan.features} onChange={e => setNewPlan({ ...newPlan, features: e.target.value })} placeholder="Feature 1, Feature 2, ..." /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newPlan.popular} onChange={e => setNewPlan({ ...newPlan, popular: e.target.checked })} className="rounded" />
            <Label className="text-sm">Popular badge</Label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addPlan}><Save className="w-4 h-4 mr-1" /> Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {plans.map(plan => (
          <div key={plan.id} className={`glass-panel rounded-xl p-4 border ${!plan.is_active ? 'opacity-50' : ''} ${plan.popular ? 'border-primary/50' : 'border-border/50'}`}>
            {editingId === plan.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Price (₹)</Label><Input type="number" value={editForm.price || 0} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Period</Label><Input value={editForm.period || ''} onChange={e => setEditForm({ ...editForm, period: e.target.value })} /></div>
                  <div><Label className="text-xs text-muted-foreground">Sort Order</Label><Input type="number" value={editForm.sort_order || 0} onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} /></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Features</Label>
                  {(editForm.features || []).map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={f} onChange={e => updateFeature(i, e.target.value)} />
                      <Button size="sm" variant="ghost" onClick={() => removeFeature(i)}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={addFeature}><Plus className="w-3 h-3 mr-1" /> Feature</Button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.popular || false} onChange={e => setEditForm({ ...editForm, popular: e.target.checked })} className="rounded" /> Popular</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.is_active ?? true} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} className="rounded" /> Active</label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1" /> Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {plan.popular && <Star className="w-4 h-4 text-primary fill-primary" />}
                  <div>
                    <span className="font-semibold">{plan.name}</span>
                    <span className="text-muted-foreground ml-2">₹{plan.price}{plan.period}</span>
                    {!plan.is_active && <span className="ml-2 text-xs text-destructive">(Inactive)</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{(plan.features || []).length} features</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(plan)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePlan(plan.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
