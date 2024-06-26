type Task<T> = (prevState?: T) => Promise<T>;

export class AsyncTaskQueue<T> {
  #queue: Task<T>[] = [];
  #runner: Promise<void> | undefined;

  add(task: Task<T>, initialState?: T) {
    this.#queue.push(task);

    if (!this.#runner) {
      this.#runner = this.#run(initialState);
    }
  }

  async #run(initialState?: T) {
    let prevState: T | undefined = initialState;

    while (this.#queue.length > 0) {
      const task = this.#queue.shift();
      if (!task) {
        continue;
      }

      prevState = await task(prevState);
    }

    this.#runner = undefined;
  }
}
