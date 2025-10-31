import { createFileRoute } from "@tanstack/react-router";
import { defineContext } from "@utilities/defineContext.tsx";

import { memo, useState } from "react";

const Context = defineContext(() => {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  return { count1, setCount1, count2, setCount2 };
});

const Counter1 = () => {
  const count1 = Context.use((v) => v.count1);
  const setState = Context.use((v) => v.setCount1);
  const increment = () => setState((s) => s + 1);

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
  const count2 = Context.use((v) => v.count2);
  const setState = Context.use((v) => v.setCount2);
  const increment = () => setState((s) => s + 1);

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
  <Context.Provider>
    {children}
  </Context.Provider>
);

const Counters = memo(function Counters() {
  return (
    <>
      <Counter1 />
      <Counter2 />
    </>
  );
});

const RouteComponent = () => {
  return (
    <StateProvider>
      <Counters />
    </StateProvider>
  );
};

export const Route = createFileRoute("/playground/")({
  component: RouteComponent,
});
