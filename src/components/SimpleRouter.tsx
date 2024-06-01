import { Component, For, ParentProps, Show } from "solid-js";

import { location } from "../lib/state/location";

import { RouteDefinition } from "~/routes";

export function SimpleRouter(props: {
  root: Component<ParentProps>;
  routes: RouteDefinition[];
}) {
  return (
    <props.root>
      <For each={props.routes}>
        {(route) => (
          <Show when={route.path === location() && route.component}>
            <route.component />
          </Show>
        )}
      </For>
    </props.root>
  );
}
