import { useRef } from 'react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckIcon, CopyIcon } from 'lucide-react';

export default function InputDemo() {
  const { copy, copied } = useCopyToClipboard();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      copy(inputRef.current.value);
    }
  };

  return (
    <div className="w-80">
      <div className="relative">
        <Input
          type="email"
          placeholder="Copy to clipboard"
          defaultValue="pnpm install @keenthemes/reui"
          ref={inputRef}
          className="pr-10"
        />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleCopy} 
                variant="ghost" 
                disabled={copied} 
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                {copied ? <CheckIcon className="stroke-green-600" size={16} /> : <CopyIcon size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">Copy to clipboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}