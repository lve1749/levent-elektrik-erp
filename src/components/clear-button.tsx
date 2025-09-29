import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function InputDemo() {
  const [inputValue, setInputValue] = useState('Click to clear');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearInput = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  return (
    <div className="w-80">
      <div className="relative">
        <Input
          placeholder="Type some input"
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pr-10"
        />
        <Button 
          onClick={handleClearInput} 
          variant="ghost" 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0" 
          disabled={inputValue === ''}
        >
          {inputValue !== '' && <X size={16} />}
        </Button>
      </div>
    </div>
  );
}