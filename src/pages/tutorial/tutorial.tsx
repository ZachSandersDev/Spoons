import { useNavigate } from "@solidjs/router";
import { Show, createSignal } from "solid-js";

import LoginPage from "../login";

import styles from "./tutorial.module.scss";

import ChevronRightIcon from "~/assets/icons/chevron_right_icon.svg?raw";
import { Button } from "~/components/ui/button";
import { setTutorialComplete } from "~/lib/state/tutorial";

export default function Tutorial() {
  const [currentStep, setCurrentStep] = createSignal(1);

  return (
    <div class={styles.tutorial}>
      <Show when={currentStep() === 1}>
        <Step1 />
      </Show>

      <Show when={currentStep() === 2}>
        <Step2 />
      </Show>

      <Show when={currentStep() === 3}>
        <Step3 />
      </Show>

      <Show when={currentStep() === 4}>
        <Step4 />
      </Show>

      <Show when={currentStep() < 4}>
        <Button
          class={styles.nextButton}
          onClick={() => setCurrentStep(currentStep() + 1)}
        >
          Next Step
          <div innerHTML={ChevronRightIcon}></div>
        </Button>
      </Show>
    </div>
  );
}

function Step1() {
  return (
    <>
      <h1>Welcome to Spoons!</h1>
      <p>
        The productivity app that <br></br> helps you get <i>less</i> done.
      </p>
    </>
  );
}

function Step2() {
  return (
    <>
      <img src="/icon-only.png"></img>

      <p>
        <span class={styles.spoons}>Spoons</span> is based on the
        &quot;spoon&quot; theory from Christine Miserandino
      </p>

      <p>
        The amount of physical or mental energy you have in a day is represented
        by &quot;spoons&quot;
      </p>
    </>
  );
}

function Step3() {
  return (
    <>
      <p>
        <span class={styles.spoons}>Spoons</span> helps you find a balance
        between what you need to do, and what you can do
      </p>

      <p>
        Each task is given a &quot;spoons&quot; score, where you can estimate
        how many spoons you need to complete it
      </p>

      <p>
        Then, the <span class={styles.spoons}>Today</span> view will only show
        you the tasks that fit your daily &quot;spoons&quot; goal
      </p>

      <p>
        (But you can always schedule a tasks for a specific day or time if
        it&apos;s important)
      </p>
    </>
  );
}

function Step4() {
  const navigate = useNavigate();

  return (
    <>
      <p>Want to give it a shot?</p>

      <p>
        <LoginPage />
      </p>

      <Button
        class={styles.nextButton}
        variant="secondary"
        onClick={() => {
          setTutorialComplete();
          navigate("/");
        }}
      >
        Skip
      </Button>
    </>
  );
}
