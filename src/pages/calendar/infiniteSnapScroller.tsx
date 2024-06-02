import { Virtualizer, createVirtualizer } from "@tanstack/solid-virtual";
import { JSX, createSignal, onMount } from "solid-js";

import styles from "./infiniteSnapScroller.module.css";

import { classes } from "~/lib/utils";

const SCROLL_SIZE = 90;

interface InfiniteSnapScrollerProps<T> {
  getPage: (offset: number) => T;
  children: (page: T) => JSX.Element;

  virtualizer: Virtualizer<HTMLDivElement, HTMLDivElement>;
  setScrollContainer: (el: HTMLDivElement | null) => void;
  handleReset: () => void;
}

export function InfiniteSnapScroller<T>(props: InfiniteSnapScrollerProps<T>) {
  onMount(props.handleReset);

  return (
    <div class={styles.scrollerContainer} ref={props.setScrollContainer}>
      <div
        style={{
          height: "100%",
          width: `${props.virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      />

      {props.virtualizer.getVirtualItems().map((item) => (
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
  );
}

function useMiddleAsOffset(index: number) {
  return index - SCROLL_SIZE / 2;
}

export function useInfiniteSnapScroller<T>(props: {
  getPage: (offset: number) => T;
  setPage: (page: T) => void;
}) {
  const [scrollContainer, setScrollContainer] =
    createSignal<HTMLDivElement | null>(null);

  function estimateSize() {
    const contentSection = document.getElementById("content");

    if (contentSection) {
      return contentSection.clientWidth;
    }

    return window.innerWidth;
  }

  let prevPage = useMiddleAsOffset(0);

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: SCROLL_SIZE,
    getScrollElement: scrollContainer,
    estimateSize,
    horizontal: true,

    onChange: (v) => {
      if (
        !v.range ||
        v.range.startIndex === prevPage ||
        // Don't update the middle page immediately when scrolling
        (useMiddleAsOffset(v.range.startIndex) === 0 && v.isScrolling)
      ) {
        return;
      }

      prevPage = v.range.startIndex;
      props.setPage(props.getPage(useMiddleAsOffset(v.range.startIndex)));
    },
  });

  const handleReset = () => {
    if (!scrollContainer()) return;

    scrollContainer()!.style.scrollSnapType = "";

    scrollContainer()!.scrollTo((SCROLL_SIZE / 2) * estimateSize(), 0);

    requestAnimationFrame(() => {
      scrollContainer()!.style.scrollSnapType = "x mandatory";
    });
  };

  return {
    props: {
      virtualizer,
      setScrollContainer,
      getPage: props.getPage,
      handleReset,
    } satisfies Partial<InfiniteSnapScrollerProps<T>>,
    resetToCenter: () => handleReset(),
  };
}
