import { useState, useEffect } from 'react';

export function useUser() {
  const [isPremium, setIsPremium] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    const premium = localStorage.getItem('pdfmaster_premium') === 'true';
    const usage = parseInt(localStorage.getItem('pdfmaster_usage') || '0', 10);
    setIsPremium(premium);
    setUsageCount(usage);
  }, []);

  const activatePremium = (code: string) => {
    if (code === '2010') {
      localStorage.setItem('pdfmaster_premium', 'true');
      setIsPremium(true);
      return true;
    }
    return false;
  };

  const incrementUsage = () => {
    if (!isPremium) {
      const newUsage = usageCount + 1;
      localStorage.setItem('pdfmaster_usage', newUsage.toString());
      setUsageCount(newUsage);
    }
  };

  return { isPremium, usageCount, activatePremium, incrementUsage };
}
