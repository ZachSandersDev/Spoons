import { Show } from "solid-js";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { user } from "~/lib/state/user";

export function Profile() {
  const getUserInitials = () =>
    user()
      ?.displayName?.split(" ")
      ?.map((name) => name.charAt(0))
      .join("");

  return (
    <>
      <Show when={user()}>
        <Avatar>
          <AvatarImage src={user()?.photoURL || ""} />
          <AvatarFallback>{getUserInitials() || "S"}</AvatarFallback>
        </Avatar>
      </Show>

      <Show when={!user()}>
        <Avatar>
          <AvatarFallback>S</AvatarFallback>
        </Avatar>
      </Show>
    </>
  );
}
