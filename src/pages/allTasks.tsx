import { Show } from "solid-js";

import { TaskCreator } from "../components/taskCreator/taskCreator";

import AddIcon from "~/assets/icons/add.svg?raw";
import { Icon } from "~/components/Icon";
import { Page } from "~/components/Page";
import { PageHeader } from "~/components/pageHeader";
import { SecondaryMessage } from "~/components/secondaryMessage/secondaryMessage";
import { TaskList } from "~/components/taskList";
import { ToolBar } from "~/components/ToolBar";
import { Button } from "~/components/ui/button";
import { createAllTasksQuery } from "~/lib/api/db";
import { useIsDesktop } from "~/lib/utils";

export default function AllTasks() {
  const isDesktop = useIsDesktop();
  const tasks = createAllTasksQuery();

  return (
    <Page>
      <PageHeader title="All Tasks">
        <Show when={isDesktop()}>
          <AllTasksTools />
        </Show>
      </PageHeader>

      <Show when={!tasks.isLoading && !tasks.data?.length}>
        <SecondaryMessage>
          <p>Task list empty!</p>
        </SecondaryMessage>
      </Show>

      <TaskList tasks={tasks.data} />

      <Show when={!isDesktop()}>
        <ToolBar>
          <AllTasksTools />
        </ToolBar>
      </Show>
    </Page>
  );
}

function AllTasksTools() {
  const isDesktop = useIsDesktop();

  return (
    <>
      <Show when={isDesktop()}>
        <TaskCreator>
          <Button variant="ghost" size="icon" innerHTML={AddIcon} />
        </TaskCreator>
      </Show>
      <Show when={!isDesktop()}>
        <TaskCreator>
          <Button>
            <Icon variant="primary" innerHTML={AddIcon} />
            New task
          </Button>
        </TaskCreator>
      </Show>
    </>
  );
}
