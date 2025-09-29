import { Button } from '@/components/ui/button';

export default function ButtonDemo() {
  return (
    <div className="flex items-center gap-2.5">
      <Button variant="ghost">Default</Button>
      <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
        Primary
      </Button>
      <Button variant="ghost" className="text-red-600 hover:text-red-700">
        Destructive
      </Button>
    </div>
  );
}