import { Input } from '@/components/ui/input';
import { Euro, TicketPercent } from 'lucide-react';

export default function InputDemo() {
  return (
    <div className="space-y-5 w-80">
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          Addon
        </span>
        <Input type="email" placeholder="Start addon" className="rounded-l-none" />
      </div>
      <div className="flex">
        <Input type="email" placeholder="End addon" className="rounded-r-none" />
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
          Addon
        </span>
      </div>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          <Euro className="w-4 h-4" />
        </span>
        <Input type="email" placeholder="Start icon addon" className="rounded-l-none" />
      </div>
      <div className="flex">
        <Input type="email" placeholder="End icon addon" className="rounded-r-none" />
        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
          <TicketPercent className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}