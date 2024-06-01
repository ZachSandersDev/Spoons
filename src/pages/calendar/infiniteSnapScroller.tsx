import { createVirtualizer } from "@tanstack/solid-virtual";
import { JSX, createEffect, onMount } from "solid-js";

import styles from "./infiniteSnapScroller.module.css";

import { classes } from "~/lib/utils";

interface InfiniteSnapScrollerProps<T> {
  isOriginal: boolean;
  getPage: (offset: number) => T;
  setPage: (page: T) => void;
  children: (page: T) => JSX.Element;
}

const SCROLL_SIZE = 100;

export function InfiniteSnapScroller<T>(props: InfiniteSnapScrollerProps<T>) {
  let scrollContainer: HTMLDivElement;

  function useMiddleAsOffset(index: number) {
    return index - SCROLL_SIZE / 2;
  }

  const virtualizer = createVirtualizer({
    count: SCROLL_SIZE,
    getScrollElement: () => scrollContainer,
    estimateSize: () => window.innerWidth,
    horizontal: true,

    onChange: (v) => {
      if (
        !v.range ||
        // Don't update the middle page immediately when scrolling
        (useMiddleAsOffset(v.range.startIndex) === 0 && v.isScrolling)
      )
        return;
      props.setPage(props.getPage(useMiddleAsOffset(v.range.startIndex)));
    },
  });

  const handleReset = () => {
    scrollContainer.style.scrollSnapType = "";
    virtualizer.scrollToIndex(SCROLL_SIZE / 2);

    setTimeout(() => {
      scrollContainer.style.scrollSnapType = "x mandatory";
    });
  };

  onMount(handleReset);
  createEffect(() => {
    // React on the center value
    if (!props.isOriginal) return;
    handleReset();
  });

  return (
    <div class={styles.scrollerContainer} ref={(el) => (scrollContainer = el)}>
      <div
        style={{
          height: "100%",
          width: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((item) => (
          <div
            class={classes(styles.scrollerPage, styles.scrollPage)}
            style={{
              transform: `translateX(${item.start}px)`,
            }}
          >
            {props.children(props.getPage(useMiddleAsOffset(item.index)))}
          </div>
        ))}
      </div>
    </div>
  );
}
