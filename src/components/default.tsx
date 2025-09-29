'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="w-[500px] text-foreground text-sm rounded-lg border border-border p-4">
      ReUI is a open-source collection of UI components and animated effects built with React, Typescript, Tailwind CSS,
      and Motion
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          Pairs beautifully with shadcn/ui. Save time and build your next project faster.
        </CollapsibleContent>

        <div className="text-end">
          <CollapsibleTrigger asChild>
            <Button variant="link" size="sm">
              {isOpen ? 'Show less' : 'Show more'}
            </Button>
          </CollapsibleTrigger>
        </div>
      </Collapsible>
    </div>
  );
}
