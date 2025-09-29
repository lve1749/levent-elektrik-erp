'use client';

import { DateInput, TimeField } from '@/components/ui/datefield';
import { Clock3 } from 'lucide-react';

export default function InputDemo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="w-80">
        <TimeField>
          <DateInput />
        </TimeField>
      </div>
      <div className="w-80">
        <div className="flex">
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            <Clock3 className="w-4 h-4" />
          </span>
          <TimeField className="flex-1">
            <DateInput className="rounded-l-none" />
          </TimeField>
        </div>
      </div>
      <div className="w-80">
        <div className="flex">
          <TimeField className="flex-1">
            <DateInput className="rounded-r-none" />
          </TimeField>
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
            <Clock3 className="w-4 h-4" />
          </span>
        </div>
      </div>
      <div className="w-80">
        <div className="relative">
          <TimeField>
            <DateInput className="pr-10" />
          </TimeField>
          <Clock3 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div className="w-80">
        <div className="relative">
          <Clock3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
          <TimeField>
            <DateInput className="pl-10" />
          </TimeField>
        </div>
      </div>
    </div>
  );
}