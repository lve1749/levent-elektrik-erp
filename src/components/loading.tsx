'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';

export default function ButtonDemo() {
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // Automatically toggle button state every 4 seconds
    const interval = setInterval(() => {
      setIsDisabled((prev) => !prev);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <Button variant="default" disabled={isDisabled}>
        {isDisabled ? <LoaderCircleIcon className="animate-spin size-4" /> : null}
        {isDisabled ? 'Submitting...' : 'Submit'}
      </Button>
    </div>
  );
}
