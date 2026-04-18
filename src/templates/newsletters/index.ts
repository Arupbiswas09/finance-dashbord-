import { NewsletterTemplate, ThemeOptions } from '@/types/newsletter-builder';

export const CorporateQ4Template: NewsletterTemplate = {
  id: 'corporate-q4',
  name: 'Corporate Q4',
  description: 'Professional quarterly report template with metrics and articles',
  theme: {
    primary: '#1e40af',
    accent: '#3b82f6',
    bgCard: '#ffffff',
    textHeading: '#1f2937',
    textBody: '#4b5563',
    cardStyle: 'rounded',
    background: 'light',
  },
  blocks: [
    {
      type: 'hero',
      data: {
        title: 'Q4 2024 Report',
        subtitle: 'Quarterly Financial Overview',
        dateBadge: 'Q4 2024',
        alignment: 'center',
      },
    },
    {
      type: 'metrics',
      data: {
        metrics: [
          { label: 'Revenue', value: '$2.4M', change: '+12%', trend: 'up' },
          { label: 'Growth', value: '24%', change: '+5%', trend: 'up' },
          { label: 'Clients', value: '1,234', change: '+89', trend: 'up' },
        ],
      },
    },
    {
      type: 'article',
      data: {
        title: 'Key Highlights',
        content: '<p>This quarter has shown significant growth across all metrics...</p>',
        imagePosition: 'top',
      },
    },
    {
      type: 'twoColumn',
      data: {
        left: {
          title: 'Achievements',
          content: '<p>Major milestones reached this quarter...</p>',
        },
        right: {
          title: 'Next Steps',
          content: '<p>Planned initiatives for next quarter...</p>',
        },
      },
    },
    {
      type: 'footer',
      data: {
        companyName: 'Your Company',
        contactInfo: {
          email: 'contact@company.com',
          phone: '+1 (555) 123-4567',
        },
      },
    },
  ],
};

export const ModernOrangeTemplate: NewsletterTemplate = {
  id: 'modern-orange',
  name: 'Modern Orange',
  description: 'Vibrant and modern template with bold colors',
  theme: {
    primary: '#ea580c',
    accent: '#fb923c',
    bgCard: '#fff7ed',
    textHeading: '#1c1917',
    textBody: '#57534e',
    cardStyle: 'rounded',
    background: 'light',
  },
  blocks: [
    {
      type: 'hero',
      data: {
        title: 'Welcome to Our Newsletter',
        subtitle: 'Stay updated with the latest news',
        alignment: 'center',
      },
    },
    {
      type: 'article',
      data: {
        title: 'Featured Article',
        content: '<p>Discover what\'s new and exciting...</p>',
        imagePosition: 'left',
      },
    },
    {
      type: 'checklist',
      data: {
        title: 'Action Items',
        items: [
          { text: 'Review quarterly goals', checked: false },
          { text: 'Schedule team meeting', checked: false },
          { text: 'Update project status', checked: true },
        ],
      },
    },
    {
      type: 'footer',
      data: {
        companyName: 'Your Company',
        unsubscribeText: 'Unsubscribe',
      },
    },
  ],
};

export const DarkFinanceTemplate: NewsletterTemplate = {
  id: 'dark-finance',
  name: 'Dark Finance',
  description: 'Professional dark theme for financial reports',
  theme: {
    primary: '#10b981',
    accent: '#34d399',
    bgCard: '#1f2937',
    textHeading: '#f9fafb',
    textBody: '#d1d5db',
    cardStyle: 'sharp',
    background: 'dark',
  },
  blocks: [
    {
      type: 'hero',
      data: {
        title: 'Financial Report',
        subtitle: 'Monthly Analysis',
        dateBadge: 'December 2024',
        alignment: 'left',
      },
    },
    {
      type: 'metrics',
      data: {
        metrics: [
          { label: 'Total Assets', value: '$45.2M', change: '+8.5%', trend: 'up' },
          { label: 'Revenue', value: '$12.8M', change: '+15.2%', trend: 'up' },
          { label: 'Profit Margin', value: '28.4%', change: '+2.1%', trend: 'up' },
        ],
      },
    },
    {
      type: 'article',
      data: {
        title: 'Market Analysis',
        content: '<p>Detailed financial analysis and market trends...</p>',
        imagePosition: 'right',
      },
    },
    {
      type: 'footer',
      data: {
        companyName: 'Finance Department',
        contactInfo: {
          email: 'finance@company.com',
        },
      },
    },
  ],
};

export const templates: NewsletterTemplate[] = [
  CorporateQ4Template,
  ModernOrangeTemplate,
  DarkFinanceTemplate,
];

export function getTemplateById(id: string): NewsletterTemplate | undefined {
  return templates.find(t => t.id === id);
}

