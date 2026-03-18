import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

const pages: Record<string, { title: string; content: string }> = {
  '/privacy': {
    title: 'Privacy Policy',
    content: `Last updated: ${new Date().toLocaleDateString()}

We at InvoicePro Cloud respect your privacy. This Privacy Policy explains how we collect, use, and protect your information.

**Information We Collect:**
- Account information (name, email, phone, company details)
- Invoice and receipt data you create
- Usage analytics and device information

**How We Use Your Data:**
- To provide and improve our services
- To save your invoices and receipts securely
- To send important service updates
- To provide customer support

**Data Storage:**
- Your data is stored securely in encrypted databases
- Invoices for free users are saved for 20 days (configurable by admin)
- Premium users get extended or permanent storage

**Your Rights:**
- Access, update, or delete your data anytime
- Export your invoices in multiple formats
- Request complete data deletion

**Contact:** For privacy concerns, reach us via the Contact page.`,
  },
  '/terms': {
    title: 'Terms of Service',
    content: `Last updated: ${new Date().toLocaleDateString()}

By using InvoicePro Cloud, you agree to these terms.

**Service Description:**
InvoicePro Cloud is an online invoice, receipt, and ticket generation platform.

**User Accounts:**
- You must provide accurate registration information
- You are responsible for maintaining account security
- One person per account; sharing is prohibited

**Acceptable Use:**
- Use the service only for lawful purposes
- Do not generate fraudulent or misleading documents
- Do not attempt to hack or disrupt the service

**Intellectual Property:**
- The platform and its design are our intellectual property
- Documents you create belong to you

**Limitation of Liability:**
- We provide the service "as is" without warranties
- We are not liable for any damages arising from use

**Changes:**
We may update these terms at any time. Continued use means acceptance.`,
  },
  '/refund': {
    title: 'Refund Policy',
    content: `Last updated: ${new Date().toLocaleDateString()}

**Free Plan:** No charges, no refunds applicable.

**Paid Plans:**
- Refund requests must be made within 7 days of purchase
- Refunds are processed within 5-7 business days
- Partial month usage is non-refundable after 7 days

**How to Request:**
Contact us through the Contact page with your account email and reason for refund.

**Non-Refundable:**
- After 7 days of subscription
- If terms of service were violated
- Promotional or discounted purchases`,
  },
  '/contact': {
    title: 'Contact Us',
    content: `We'd love to hear from you!

**Email:** support@invoicepro.cloud

**Business Hours:** Monday - Saturday, 9 AM - 6 PM IST

**Response Time:** We typically respond within 24 hours.

**For Technical Issues:**
Please include your account email and a description of the issue.

**For Business Inquiries:**
Contact us for custom plans, API access, or partnership opportunities.`,
  },
};

export default function SEOPages() {
  const location = useLocation();
  const page = pages[location.pathname];

  if (!page) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Home</Button></Link>
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold">{page.title}</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground leading-relaxed">
          {page.content}
        </div>
      </main>
    </div>
  );
}
