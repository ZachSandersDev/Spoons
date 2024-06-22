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
import { createMediaQuery } from "~/lib/createMediaQuery";

export default function AllTasks() {
  const isMobile = createMediaQuery("(max-width: 768px)");
  const tasks = createAllTasksQuery();

  return (
    <Page>
      <PageHeader title="All Tasks">
        <Show when={!isMobile()}>
          <AllTasksTools />
        </Show>
      </PageHeader>

      <Show when={!tasks.isLoading && !tasks.data?.length}>
        <SecondaryMessage>
          <p>Task list empty!</p>
        </SecondaryMessage>
      </Show>

      <TaskList tasks={tasks.data} />

      <Show when={isMobile()}>
        <ToolBar>
          <AllTasksTools />
        </ToolBar>
      </Show>
    </Page>
  );
}

function AllTasksTools() {
  const isMobile = createMediaQuery("(max-width: 768px)");

  return (
    <>
      <Show when={!isMobile()}>
        <TaskCreator>
          <Button variant="ghost" size="icon" innerHTML={AddIcon} />
        </TaskCreator>
      </Show>
      <Show when={isMobile()}>
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
