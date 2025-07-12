import { Card } from "@components/containers/card/Card.tsx";
import { List } from "@components/containers/List.tsx";
import { InputField } from "@components/forms/inputs/InputField.tsx";
import { Text } from "@components/typography/Text.tsx";
import { For } from "@components/utility/For.tsx";
import { icons } from "lucide-react";
import { useMemo, useState } from "react";
import { useResponsiveValue } from "../../../core/hooks/useResponsiveValue.tsx";

const preparedIcons = Object.entries(icons);
export const IconPalleteView = () => {
  const [query, setQuery] = useState("");

  const filteredIcons = useMemo(
    () => {
      const filter = query.replaceAll(" ", "").toLowerCase();

      return preparedIcons.filter(([name]) => name.toLowerCase().includes(filter));
    },
    [query],
  );

  const columns = useResponsiveValue({ xl: 12, lg: 8, md: 6, sm: 4, xs: 3 });
  const rowCount = Math.ceil(filteredIcons.length / columns);

  return (
    <div className="flex flex-col gap-2">
      <InputField placeholder="Search..." value={query} onValueChange={setQuery} />
      <Card className="h-[480px] overflow-auto">
        <List items={filteredIcons} estimateSize={82 + 2} maxHeight={440} count={rowCount}>
          {({ key, start, index }, i) => (
            <For
              key={key}
              each={filteredIcons.slice(index * columns, (index + 1) * columns)}
              as="div"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2 absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${start + (i * 2)}px)` }}
            >
              {([name, Icon]) => (
                <Card
                  key={name}
                  onClick={() => navigator.clipboard.writeText(name)}
                  className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:text-primary-11"
                >
                  <Icon />
                  <Text className="pb-1 text-xs overflow-auto max-w-full select-all">{name}</Text>
                </Card>
              )}
            </For>
          )}
        </List>
      </Card>
    </div>
  );
};
