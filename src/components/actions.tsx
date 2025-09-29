import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RiAlertFill } from '@remixicon/react';

export default function AlertDemo() {
  return (
    <div className="flex flex-col items-center w-full lg:max-w-[75%] gap-6">
      <Alert variant="primary" close={false}>
        <AlertIcon>
          <RiAlertFill />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Example Alert Title</AlertTitle>
          <AlertDescription>
            <p>
              Insert the alert description here. This is an example of a two-line message for better visual clarity.
            </p>
            <div className="space-x-3.5">
              <Button variant="outline" size="default">
                Upgrade
              </Button>
              <Button variant="outline" size="default">
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="destructive" appearance="light" close={false}>
        <AlertIcon>
          <RiAlertFill />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Example Alert Title</AlertTitle>
          <AlertDescription>
            <p>
              Insert the alert description here. This is an example of a two-line message for better visual clarity.
            </p>
            <div className="space-x-3.5">
              <Button variant="link" size="default">
                Upgrade
              </Button>
              <Button variant="link" size="default">
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  );
}
