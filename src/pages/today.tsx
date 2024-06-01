import { DateTime } from "luxon";
import { Show, createMemo } from "solid-js";

import { TaskCreator } from "../components/taskCreator/taskCreator";

import styles from "./today.module.css";

import AddIcon from "~/assets/icons/add.svg?raw";
import MoreIcon from "~/assets/icons/more.svg?raw";
import { Menu, MenuItem } from "~/components/menu";
import { PageHeader } from "~/components/pageHeader";
import { RangeSelector } from "~/components/rangeSelector";
import { SecondaryMessage } from "~/components/secondaryMessage/secondaryMessage";
import { TaskList } from "~/components/taskList";
import { Button } from "~/components/ui/button";

import {
  createDayProgressQuery,
  createPreferencesQuery,
  createTodayTasksQuery,
  useDb,
} from "~/lib/api/db";
import { chunkTasks } from "~/lib/taskChunker";
import { DayProgress } from "~/lib/types/DayProgress";
import { TaskEvent } from "~/lib/types/TaskEvent";

const DEFAULT_CAPACITY = 5;

export default function Today() {
  const db = useDb();

  const todayString = DateTime.now().toFormat("yyyy-MM-dd");

  const todayTasks = createTodayTasksQuery();
  const prefs = createPreferencesQuery();

  const dayProgress = createDayProgressQuery(() => todayString);

  const userGoal = () => prefs.data?.spoonsPerDay || DEFAULT_CAPACITY;
  const spoonsCompleted = () => dayProgress.data?.spoonsCompleted || 0;
  const capacity = () => dayProgress.data?.spoonTarget || userGoal();
  const remainingSpoons = () => capacity() - spoonsCompleted();

  const hasTasks = () => !!todayTasks.data && todayTasks.data?.length > 0;
  const hasUnreachableTasks = () =>
    !!todayTasks.data?.some((t) => t.spoons > remainingSpoons());

  const tasks = createMemo(() => {
    if (!hasTasks() || remainingSpoons() <= 0) {
      return [];
    }

    const taskChunks = chunkTasks(todayTasks.data!, remainingSpoons());
    return taskChunks[0]?.tasks || [];
  });

  const handleTaskComplete = async (task: TaskEvent) => {
    const newDayProg: DayProgress = {
      id: todayString,
      spoonsCompleted: 0,
      ...dayProgress.data,
    };

    newDayProg.spoonsCompleted! += task.spoons;

    if (!dayProgress.data) {
      db().dayProgress.addDayProgress(newDayProg);
      return;
    }

    db().dayProgress.setDayProgress(newDayProg);
  };

  const handleAddCapacity = async (numToAdd: number) => {
    const newDayProg: DayProgress = { id: todayString, ...dayProgress.data };

    if (!newDayProg.spoonTarget) {
      newDayProg.spoonTarget = userGoal();
    }

    // Add another day's worth of spoons to today's target
    newDayProg.spoonTarget! += numToAdd;
    db().dayProgress.setDayProgress(newDayProg);
  };

  const resetProgress = async () => {
    if (!dayProgress.data) return;

    const newDayProg: DayProgress = {
      ...dayProgress.data,
      spoonsCompleted: 0,
    };

    db().dayProgress.setDayProgress(newDayProg);
  };

  const resetTarget = async () => {
    if (!dayProgress.data) return;

    const newDayProg: DayProgress = {
      ...dayProgress.data,
      spoonTarget: userGoal(),
    };

    db().dayProgress.setDayProgress(newDayProg);
  };

  return (
    <>
      <PageHeader title="Today">
        <Menu
          trigger={<Button variant="ghost" size="icon" innerHTML={MoreIcon} />}
        >
          <MenuItem onClick={resetProgress}>
            Reset today&rsquo;s progress
          </MenuItem>
          <MenuItem onClick={resetTarget}>
            Reset today&rsquo;s added spoons
          </MenuItem>
        </Menu>

        <TaskCreator>
          <Button variant="ghost" size="icon" innerHTML={AddIcon} />
        </TaskCreator>
      </PageHeader>

      <TaskList
        tasks={tasks()}
        isLoading={todayTasks.isLoading}
        onTaskComplete={handleTaskComplete}
      />

      <div class={styles.stats}>
        <Show when={spoonsCompleted()}>
          <span>{spoonsCompleted()} complete!</span>
        </Show>
        <Show when={remainingSpoons() > 0}>
          <span>{remainingSpoons()} remaining</span>
        </Show>
      </div>

      <Show when={!todayTasks.isLoading && !hasTasks()}>
        <SecondaryMessage>
          <p>Task list empty!</p>
        </SecondaryMessage>
      </Show>

      <Show
        when={
          hasTasks() &&
          (spoonsCompleted() >= capacity() || hasUnreachableTasks())
        }
      >
        <SecondaryMessage>
          <p>Congrats! You&rsquo;ve reached your goal for today!</p>
          <p></p>
          <p>
            If you&rsquo;d like to take on more, you can add more spoons to
            today&rsquo;s goal
          </p>

          <RangeSelector
            value={0}
            options={new Array(5).fill(0).map((_, i) => ({
              value: i + 1,
              label: `${i + 1}`,
            }))}
            onChange={handleAddCapacity}
          />
        </SecondaryMessage>
      </Show>
    </>
  );
}
