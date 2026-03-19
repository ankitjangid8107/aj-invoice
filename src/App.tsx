import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import PaymentReceipt from "./pages/PaymentReceipt";
import TicketEditor from "./pages/TicketEditor";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import SEOPages from "./pages/SEOPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment-receipt" element={<PaymentReceipt />} />
            <Route path="/ticket-editor" element={<TicketEditor />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/privacy" element={<SEOPages />} />
            <Route path="/terms" element={<SEOPages />} />
            <Route path="/refund" element={<SEOPages />} />
            <Route path="/contact" element={<SEOPages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
