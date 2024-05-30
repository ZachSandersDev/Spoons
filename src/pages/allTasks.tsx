import { Show } from "solid-js";

import { TaskCreator } from "../components/taskCreator/taskCreator";

import AddIcon from "~/assets/icons/add.svg?raw";
import { PageHeader } from "~/components/pageHeader";
import { SecondaryMessage } from "~/components/secondaryMessage/secondaryMessage";
import { TaskList } from "~/components/taskList";
import { Button } from "~/components/ui/button";
import { createAllTasksQuery } from "~/lib/api/db";

export default function AllTasks() {
  const tasks = createAllTasksQuery();

  return (
    <>
      <PageHeader title="All Tasks">
        <TaskCreator>
          <Button variant="ghost" size="icon" innerHTML={AddIcon} />
        </TaskCreator>
      </PageHeader>

      <Show when={!tasks.isLoading && !tasks.data?.length}>
        <SecondaryMessage>
          <p>Task list empty!</p>
        </SecondaryMessage>
      </Show>

      <TaskList tasks={tasks.data} />
    </>
  );
}
