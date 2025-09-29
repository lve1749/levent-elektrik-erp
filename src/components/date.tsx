'use client';

import { DateField, DateInput } from '@/components/ui/datefield';
import { CalendarDays } from 'lucide-react';

export default function InputDemo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="w-80">
        <DateField>
          <DateInput />
        </DateField>
      </div>
      <div className="w-80">
        <div className="flex">
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            <CalendarDays className="w-4 h-4" />
          </span>
          <DateField className="flex-1">
            <DateInput className="rounded-l-none" />
          </DateField>
        </div>
      </div>
      <div className="w-80">
        <div className="flex">
          <DateField className="flex-1">
            <DateInput className="rounded-r-none" />
          </DateField>
          <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">
            <CalendarDays className="w-4 h-4" />
          </span>
        </div>
      </div>
      <div className="w-80">
        <div className="relative">
          <DateField>
            <DateInput className="pr-10" />
          </DateField>
          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>
      </div>
      <div className="w-80">
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
          <DateField>
            <DateInput className="pl-10" />
          </DateField>
        </div>
      </div>
    </div>
  );
}