import React, { useEffect, useState } from 'react';

export const BlobIframe = ({ content, title, className, allow }: { content: string, title?: string, className?: string, allow?: string }) => {
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (!content) return;
    
    if (content.startsWith('http') || content.startsWith('data:') || content.startsWith('blob:')) {
      setBlobUrl(content);
      return;
    }
    
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [content]);
  
  if (!blobUrl) return null;
  
  return (
    <iframe 
      src={blobUrl}
      className={className}
      title={title}
      allow={allow || "fullscreen"}
      tabIndex={-1}
    />
  );
};
