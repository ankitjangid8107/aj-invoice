import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  FileText, Smartphone, Ticket, XCircle, Shield, User, Home,
  Menu, X, CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { to: '/dashboard', label: 'Invoice', icon: FileText },
  { to: '/payment-receipt', label: 'UPI Receipt', icon: Smartphone },
  { to: '/ticket-editor', label: 'Bus Ticket', icon: Ticket },
  { to: '/booking-cancelled', label: 'Cancel Ticket', icon: XCircle },
  { to: '/subscription', label: 'Plans', icon: CreditCard },
];

export default function AppNavbar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin')
      .then(({ data }) => setIsAdmin(!!data?.length));
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">InvoicePro</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={isActive(item.to) ? 'default' : 'ghost'}
                  size="sm"
                  className={`text-xs ${isActive(item.to) ? 'bg-primary text-primary-foreground shadow-sm' : ''}`}
                >
                  <item.icon className="w-3.5 h-3.5 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm" className={`text-xs ${isActive('/admin') ? 'bg-primary text-primary-foreground' : ''}`}>
                  <Shield className="w-3.5 h-3.5 mr-1.5" /> Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant={isActive('/profile') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-[80px] text-xs">{profile?.full_name || 'Profile'}</span>
              </Button>
            </Link>
            {/* Mobile hamburger */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <nav className="flex flex-col p-2 gap-1">
              {navItems.map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant={isActive(item.to) ? 'default' : 'ghost'}
                    size="sm"
                    className={`w-full justify-start ${isActive(item.to) ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm" className={`w-full justify-start ${isActive('/admin') ? 'bg-primary text-primary-foreground' : ''}`}>
                    <Shield className="w-4 h-4 mr-2" /> Admin Panel
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl safe-area-bottom">
        <nav className="flex items-center justify-around h-14 px-1">
          {navItems.slice(0, 4).map(item => (
            <Link key={item.to} to={item.to} className="flex-1">
              <div className={`flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors ${isActive(item.to) ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'text-primary' : ''}`} />
                <span className="text-[10px] font-medium leading-none">{item.label.split(' ')[0]}</span>
              </div>
            </Link>
          ))}
          <Link to="/profile" className="flex-1">
            <div className={`flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
              <User className={`w-5 h-5 ${isActive('/profile') ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-medium leading-none">Profile</span>
            </div>
          </Link>
        </nav>
      </div>
    </>
  );
}
