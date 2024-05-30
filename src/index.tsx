/* @refresh reload */
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { App } from "./app";
import { routes } from "./routes";

import "./styles/index.css";
import "./styles/theme.scss";
import "./styles/overrides.scss";

const root = document.getElementById("root");
render(() => <Router root={App}>{routes}</Router>, root!);
