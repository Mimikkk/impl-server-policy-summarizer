import { Card } from "@components/containers/card/Card.tsx";
import { List, ListItem } from "@components/containers/List.tsx";
import { InputField } from "@components/forms/inputs/InputField.tsx";
import { Text } from "@components/typography/Text.tsx";
import { For } from "@components/utility/For.tsx";
import { useResponsiveValue } from "@hooks/useResponsiveValue.tsx";
import { icons } from "lucide-react";
import { type ComponentType, useCallback, useMemo, useState } from "react";

const preparedIcons = Object.entries(icons);
export const IconPalleteView = () => {
  const [query, setQuery] = useState("");

  const filteredIcons = useMemo(() => {
    const filter = query.replaceAll(" ", "").toLowerCase();

    return preparedIcons.filter(([name]) => name.toLowerCase().includes(filter));
  }, [query]);

  const columns = useResponsiveValue({ xl: 12, lg: 8, md: 6, sm: 4, xs: 3 });
  const rowCount = Math.ceil(filteredIcons.length / columns);

  return (
    <div className="flex flex-col gap-2">
      <InputField placeholder="Search..." value={query} onValueChange={setQuery} />
      <Card className="h-[480px] overflow-auto">
        <List items={filteredIcons} estimateSize={82 + 2} maxHeight={440} count={rowCount}>
          {useCallback(
            ({ key, start, index }: ListItem<[string, ComponentType]>, i: number) => (
              <For
                key={key}
                each={filteredIcons.slice(index * columns, (index + 1) * columns)}
                as="div"
                className="absolute top-0 left-0 grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12"
                style={{ transform: `translateY(${start + i * 2}px)` }}
              >
                {([name, Icon]: [string, ComponentType]) => (
                  <Card
                    key={name}
                    onClick={() => navigator.clipboard.writeText(name)}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 hover:text-primary-11"
                  >
                    <Icon />
                    <Text className="max-w-full overflow-auto pb-1 text-xs select-all">{name}</Text>
                  </Card>
                )}
              </For>
            ),
            [],
          )}
        </List>
      </Card>
    </div>
  );
};
