import { NewsletterSection, NewsletterStyle } from "@/types/newsletter";

interface NewsletterPreviewProps {
  title: string;
  subject: string;
  sections: NewsletterSection[];
  style: NewsletterStyle;
}

const NewsletterPreview = ({ title, subject, sections, style }: NewsletterPreviewProps) => {
  const headerBg = style.colors.headerBg || style.colors.primary;
  const footerBg = style.colors.footerBg || style.colors.primary;
  const textHeading = style.colors.textHeading || (style.layout?.headerStyle === 'dark' ? '#ffffff' : style.colors.primary);
  const textBody = style.colors.textBody || '#1f2937';
  const textMuted = style.colors.textMuted || '#6b7280';
  const cardBg = style.colors.cardBg || '#ffffff';
  const border = style.colors.border || '#e5e7eb';
  const headerStyle = style.layout?.headerStyle || 'dark';
  const footerStyle = style.layout?.footerStyle || 'dark';
  const cardStyle = style.layout?.cardStyle || 'rounded';
  const spacing = style.layout?.spacing || 'normal';

  const getSpacing = () => {
    switch (spacing) {
      case 'compact': return { section: '24px', paragraph: '12px' };
      case 'spacious': return { section: '48px', paragraph: '20px' };
      default: return { section: '40px', paragraph: '16px' };
    }
  };

  const spacingValues = getSpacing();
  const borderRadius = cardStyle === 'rounded' ? '8px' : cardStyle === 'elevated' ? '12px' : '0';
  const boxShadow = cardStyle === 'elevated' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none';

  return (
    <div 
      className="newsletter-preview"
      style={{
        fontFamily: style.fonts.body,
        maxWidth: '600px',
        margin: '0 auto',
        background: style.colors.background || '#ffffff',
        padding: '0',
        color: textBody,
      }}
    >
      {/* Header */}
      <div 
        style={{
          backgroundColor: headerStyle === 'dark' ? headerBg : headerStyle === 'gradient' 
            ? `linear-gradient(135deg, ${headerBg} 0%, ${style.colors.secondary} 100%)`
            : cardBg,
          padding: '40px',
          borderRadius: headerStyle === 'dark' || headerStyle === 'gradient' ? `${borderRadius} ${borderRadius} 0 0` : '0',
          marginBottom: spacingValues.section,
        }}
      >
        <h1 
          style={{
            color: headerStyle === 'dark' || headerStyle === 'gradient' ? '#ffffff' : textHeading,
            fontFamily: style.fonts.heading,
            fontSize: '32px',
            fontWeight: 'bold',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {title || 'Newsletter Title'}
        </h1>
        {subject && (
          <p 
            style={{
              color: headerStyle === 'dark' || headerStyle === 'gradient' ? 'rgba(255, 255, 255, 0.9)' : textMuted,
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '10px',
              marginBottom: 0,
            }}
          >
            {subject}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="newsletter-sections" style={{ padding: '0 40px' }}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            style={{
              marginBottom: spacingValues.section,
              padding: cardStyle === 'elevated' ? '24px' : '0',
              paddingBottom: spacingValues.section,
              borderBottom: index < sections.length - 1 ? `1px solid ${border}` : 'none',
              backgroundColor: cardStyle === 'elevated' ? cardBg : 'transparent',
              borderRadius: cardStyle === 'elevated' ? borderRadius : '0',
              boxShadow: cardStyle === 'elevated' ? boxShadow : 'none',
            }}
          >
            <div
              className="newsletter-content"
              dangerouslySetInnerHTML={{ __html: section.content }}
              style={{
                lineHeight: '1.8',
                fontSize: '16px',
                color: textBody,
              }}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div 
        style={{
          marginTop: spacingValues.section,
          padding: '40px',
          backgroundColor: footerStyle === 'dark' ? footerBg : cardBg,
          borderRadius: footerStyle === 'dark' ? `0 0 ${borderRadius} ${borderRadius}` : '0',
          borderTop: footerStyle === 'light' ? `1px solid ${border}` : 'none',
          textAlign: 'center',
          fontSize: '12px',
          color: footerStyle === 'dark' ? 'rgba(255, 255, 255, 0.8)' : textMuted,
        }}
      >
        <p style={{ margin: 0 }}>This newsletter was created with Smart Accounting</p>
      </div>

      {/* Inline styles for newsletter content */}
      <style>{`
        .newsletter-preview h1,
        .newsletter-preview h2,
        .newsletter-preview h3,
        .newsletter-preview h4,
        .newsletter-preview h5,
        .newsletter-preview h6,
        .newsletter-preview .newsletter-content h1,
        .newsletter-preview .newsletter-content h2,
        .newsletter-preview .newsletter-content h3,
        .newsletter-preview .newsletter-content h4,
        .newsletter-preview .newsletter-content h5,
        .newsletter-preview .newsletter-content h6 {
          font-family: ${style.fonts.heading} !important;
          color: ${textHeading} !important;
          margin-top: ${spacingValues.paragraph} !important;
          margin-bottom: ${spacingValues.paragraph} !important;
          font-weight: bold !important;
          display: block;
        }
        
        .newsletter-preview h1,
        .newsletter-preview .newsletter-content h1 {
          font-size: 28px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview h2,
        .newsletter-preview .newsletter-content h2 {
          font-size: 24px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview h3,
        .newsletter-preview .newsletter-content h3 {
          font-size: 20px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview h4,
        .newsletter-preview .newsletter-content h4 {
          font-size: 18px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview h5,
        .newsletter-preview .newsletter-content h5 {
          font-size: 16px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview h6,
        .newsletter-preview .newsletter-content h6 {
          font-size: 14px !important;
          font-weight: bold !important;
        }
        
        .newsletter-preview p,
        .newsletter-preview .newsletter-content p {
          margin-bottom: ${spacingValues.paragraph};
          line-height: 1.8;
          color: ${textBody};
        }
        
        /* Ensure headings are not affected by parent color */
        .newsletter-preview .newsletter-content > * {
          color: ${textBody};
        }
        
        .newsletter-preview .newsletter-content h1,
        .newsletter-preview .newsletter-content h2,
        .newsletter-preview .newsletter-content h3,
        .newsletter-preview .newsletter-content h4,
        .newsletter-preview .newsletter-content h5,
        .newsletter-preview .newsletter-content h6 {
          color: ${textHeading} !important;
        }
        
        .newsletter-preview ul,
        .newsletter-preview ol {
          margin-bottom: ${spacingValues.paragraph};
          padding-left: 24px;
          color: ${textBody};
        }
        
        .newsletter-preview li {
          margin-bottom: 8px;
          line-height: 1.6;
        }
        
        .newsletter-preview blockquote {
          border-left: 4px solid ${style.colors.secondary};
          padding-left: 16px;
          margin: ${spacingValues.paragraph} 0;
          font-style: italic;
          color: ${textMuted};
          background-color: ${cardBg};
          padding: 16px;
          border-radius: ${borderRadius};
        }
        
        .newsletter-preview a {
          color: ${style.colors.primary};
          text-decoration: underline;
        }
        
        .newsletter-preview a:hover {
          color: ${style.colors.secondary};
        }
        
        .newsletter-preview img {
          max-width: 100%;
          height: auto;
          border-radius: ${borderRadius};
          margin: ${spacingValues.paragraph} 0;
        }
        
        .newsletter-preview strong {
          font-weight: bold;
          color: ${textHeading};
        }
        
        .newsletter-preview em {
          font-style: italic;
        }
        
        .newsletter-preview u {
          text-decoration: underline;
        }
        
        .newsletter-preview code {
          background-color: ${cardBg};
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: ${style.colors.primary};
        }
        
        .newsletter-preview pre {
          background-color: ${cardBg};
          padding: 16px;
          border-radius: ${borderRadius};
          overflow-x: auto;
          border: 1px solid ${border};
        }
        
        .newsletter-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: ${spacingValues.paragraph} 0;
        }
        
        .newsletter-preview table th,
        .newsletter-preview table td {
          padding: 12px;
          border: 1px solid ${border};
          text-align: left;
        }
        
        .newsletter-preview table th {
          background-color: ${style.colors.primary};
          color: ${headerStyle === 'dark' ? '#ffffff' : textHeading};
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default NewsletterPreview;

