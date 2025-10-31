import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext } from "@utilities/createSelectorContext.tsx";

import { type Dispatch, type SetStateAction, useState } from "react";

const context = createContext<
  [{ count1: number; count2: number }, Dispatch<SetStateAction<{ count1: number; count2: number }>>]
>(null!);

const Counter1 = () => {
  const count1 = useContext(context, (v) => v[0].count1);
  const setState = useContext(context, (v) => v[1]);
  const increment = () => setState((s: { count1: number; count2: number }) => ({ ...s, count1: s.count1 + 1 }));

  return (
    <div>
      <span>Count1: {count1}</span>
      <button type="button" onClick={increment}>
        +1
      </button>
      {Math.random()}
    </div>
  );
};

const Counter2 = () => {
  const count2 = useContext(context, (v) => v[0].count2);
  const setState = useContext(context, (v) => v[1]);
  const increment = () => setState((s: { count1: number; count2: number }) => ({ ...s, count2: s.count2 + 1 }));

  return (
    <div>
      <span>Count2: {count2}</span>
      <button type="button" onClick={increment}>
        +1
      </button>
      {Math.random()}
    </div>
  );
};

const StateProvider = ({ children }: { children: React.ReactNode }) => (
  <context.Provider value={useState<{ count1: number; count2: number }>({ count1: 0, count2: 0 })}>
    {children}
  </context.Provider>
);

export const Route = createFileRoute("/playground/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <StateProvider>
      <Counter1 />
      <Counter2 />
    </StateProvider>
  );
}
