import { Button } from "@components/actions/Button.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { Text } from "@components/typography/Text.tsx";
import { memo } from "react";

export const ComponentsView = memo(function ComponentsView() {
  return (
    <div className="flex flex-col gap-4">
      <Card label="card label" className="flex flex-col">
        <Text>Text</Text>
        <Text light>Text light</Text>
      </Card>
      <div className="flex flex-col gap-2">
        <Text>Button components</Text>
        <Button>Button</Button>
      </div>
    </div>
  );
});
