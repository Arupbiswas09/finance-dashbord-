import { NewsletterBlock, ThemeOptions } from '@/types/newsletter-builder';
import { TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';

interface NewsletterRendererProps {
  title: string;
  subject: string;
  blocks: NewsletterBlock[];
  theme: ThemeOptions;
}

export const NewsletterRenderer = ({ title, subject, blocks, theme }: NewsletterRendererProps) => {
  const cardStyle = theme.cardStyle === 'rounded' ? 'rounded-lg' : 'rounded-none';
  const bgColor = theme.background === 'dark' ? '#111827' : '#f9fafb';

  const renderBlock = (block: NewsletterBlock) => {
    switch (block.type) {
      case 'hero':
        const heroData = block.data as any;
        return (
          <div
            className={`${cardStyle} p-8 mb-6 text-${heroData.alignment || 'center'}`}
            style={{
              backgroundColor: theme.bgCard,
              backgroundImage: heroData.imageUrl ? `url(${heroData.imageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {heroData.imageUrl && (
              <div
                className="absolute inset-0 bg-black bg-opacity-40"
                style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
              />
            )}
            <div className="relative z-10">
              {heroData.dateBadge && (
                <span
                  className="inline-block px-3 py-1 mb-4 text-sm font-medium"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#fff',
                    borderRadius: '0.25rem',
                  }}
                >
                  {heroData.dateBadge}
                </span>
              )}
              <h1
                className="text-4xl font-bold mb-2"
                style={{ color: theme.textHeading }}
              >
                {heroData.title}
              </h1>
              {heroData.subtitle && (
                <p
                  className="text-xl"
                  style={{ color: theme.textBody }}
                >
                  {heroData.subtitle}
                </p>
              )}
            </div>
          </div>
        );

      case 'metrics':
        const metricsData = block.data as any;
        return (
          <div className={`${cardStyle} p-6 mb-6`} style={{ backgroundColor: theme.bgCard }}>
            <div className="grid grid-cols-3 gap-4">
              {metricsData.metrics?.map((metric: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-sm mb-1" style={{ color: theme.textBody }}>
                    {metric.label}
                  </div>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: theme.primary }}
                  >
                    {metric.value}
                  </div>
                  {metric.change && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      {metric.trend === 'up' && (
                        <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />
                      )}
                      {metric.trend === 'down' && (
                        <TrendingDown className="h-4 w-4" style={{ color: '#ef4444' }} />
                      )}
                      {metric.trend === 'neutral' && (
                        <Minus className="h-4 w-4" style={{ color: theme.textBody }} />
                      )}
                      <span style={{ color: theme.textBody }}>{metric.change}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'article':
        const articleData = block.data as any;
        return (
          <div className={`${cardStyle} p-6 mb-6`} style={{ backgroundColor: theme.bgCard }}>
            {articleData.imagePosition === 'top' && articleData.imageUrl && (
              <img
                src={articleData.imageUrl}
                alt={articleData.title}
                className="w-full h-64 object-cover mb-4"
                style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
              />
            )}
            <div className={`flex gap-6 ${articleData.imagePosition === 'left' || articleData.imagePosition === 'right' ? 'flex-row' : 'flex-col'}`}>
              {articleData.imagePosition === 'left' && articleData.imageUrl && (
                <img
                  src={articleData.imageUrl}
                  alt={articleData.title}
                  className="w-1/3 h-48 object-cover"
                  style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
                />
              )}
              <div className="flex-1">
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ color: theme.textHeading }}
                >
                  {articleData.title}
                </h2>
                <div
                  className="prose max-w-none"
                  style={{ color: theme.textBody }}
                  dangerouslySetInnerHTML={{ __html: articleData.content }}
                />
                {(articleData.author || articleData.date) && (
                  <div className="mt-4 text-sm" style={{ color: theme.textBody }}>
                    {articleData.author && <span>By {articleData.author}</span>}
                    {articleData.author && articleData.date && <span> • </span>}
                    {articleData.date && <span>{articleData.date}</span>}
                  </div>
                )}
              </div>
              {articleData.imagePosition === 'right' && articleData.imageUrl && (
                <img
                  src={articleData.imageUrl}
                  alt={articleData.title}
                  className="w-1/3 h-48 object-cover"
                  style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
                />
              )}
            </div>
          </div>
        );

      case 'twoColumn':
        const twoColumnData = block.data as any;
        return (
          <div className={`${cardStyle} p-6 mb-6`} style={{ backgroundColor: theme.bgCard }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                {twoColumnData.left?.imageUrl && (
                  <img
                    src={twoColumnData.left.imageUrl}
                    alt="Left"
                    className="w-full h-32 object-cover mb-3"
                    style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
                  />
                )}
                {twoColumnData.left?.title && (
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: theme.textHeading }}
                  >
                    {twoColumnData.left.title}
                  </h3>
                )}
                <div
                  className="prose max-w-none"
                  style={{ color: theme.textBody }}
                  dangerouslySetInnerHTML={{ __html: twoColumnData.left?.content || '' }}
                />
              </div>
              <div>
                {twoColumnData.right?.imageUrl && (
                  <img
                    src={twoColumnData.right.imageUrl}
                    alt="Right"
                    className="w-full h-32 object-cover mb-3"
                    style={{ borderRadius: theme.cardStyle === 'rounded' ? '0.5rem' : '0' }}
                  />
                )}
                {twoColumnData.right?.title && (
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: theme.textHeading }}
                  >
                    {twoColumnData.right.title}
                  </h3>
                )}
                <div
                  className="prose max-w-none"
                  style={{ color: theme.textBody }}
                  dangerouslySetInnerHTML={{ __html: twoColumnData.right?.content || '' }}
                />
              </div>
            </div>
          </div>
        );

      case 'checklist':
        const checklistData = block.data as any;
        return (
          <div className={`${cardStyle} p-6 mb-6`} style={{ backgroundColor: theme.bgCard }}>
            {checklistData.title && (
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: theme.textHeading }}
              >
                {checklistData.title}
              </h3>
            )}
            <ul className="space-y-2">
              {checklistData.items?.map((item: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div
                    className="mt-1 flex-shrink-0"
                    style={{ color: item.checked ? theme.primary : theme.textBody }}
                  >
                    {item.checked ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <div
                        className="h-5 w-5 border-2"
                        style={{
                          borderColor: theme.textBody,
                          borderRadius: '0.25rem',
                        }}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      color: theme.textBody,
                      textDecoration: item.checked ? 'line-through' : 'none',
                    }}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'footer':
        const footerData = block.data as any;
        return (
          <div
            className={`${cardStyle} p-6 mt-6`}
            style={{
              backgroundColor: theme.background === 'dark' ? '#1f2937' : '#f3f4f6',
              borderTop: `2px solid ${theme.primary}`,
            }}
          >
            {footerData.companyName && (
              <h4
                className="font-bold mb-2"
                style={{ color: theme.textHeading }}
              >
                {footerData.companyName}
              </h4>
            )}
            {footerData.contactInfo && (
              <div className="text-sm mb-4" style={{ color: theme.textBody }}>
                {footerData.contactInfo.email && <div>{footerData.contactInfo.email}</div>}
                {footerData.contactInfo.phone && <div>{footerData.contactInfo.phone}</div>}
                {footerData.contactInfo.address && <div>{footerData.contactInfo.address}</div>}
              </div>
            )}
            {footerData.socialLinks && footerData.socialLinks.length > 0 && (
              <div className="flex gap-4 mb-4">
                {footerData.socialLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    style={{ color: theme.primary }}
                    className="text-sm underline"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
            {footerData.unsubscribeText && (
              <div className="text-xs mt-4" style={{ color: theme.textBody }}>
                {footerData.unsubscribeText}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="newsletter-preview"
      style={{
        backgroundColor: bgColor,
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <style>{`
        .newsletter-preview {
          --primary: ${theme.primary};
          --accent: ${theme.accent};
          --bg-card: ${theme.bgCard};
          --text-heading: ${theme.textHeading};
          --text-body: ${theme.textBody};
        }
        .newsletter-preview h1,
        .newsletter-preview h2,
        .newsletter-preview h3 {
          color: var(--text-heading);
        }
        .newsletter-preview p,
        .newsletter-preview li {
          color: var(--text-body);
          line-height: 1.6;
        }
        .newsletter-preview a {
          color: var(--primary);
        }
      `}</style>
      <div
        style={{
          borderBottom: `3px solid ${theme.primary}`,
          paddingBottom: '20px',
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            color: theme.textHeading,
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {title || 'Newsletter Title'}
        </h1>
        {subject && (
          <p
            style={{
              color: theme.textBody,
              fontSize: '14px',
              marginTop: '10px',
              marginBottom: 0,
            }}
          >
            {subject}
          </p>
        )}
      </div>
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
};

