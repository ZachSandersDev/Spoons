/* @refresh reload */
import { render } from "solid-js/web";

import { App } from "./app";
import { SimpleRouter } from "./components/SimpleRouter";
import { routes } from "./routes";

import "./styles/index.css";
import "./styles/theme.scss";
import "./styles/overrides.scss";

const root = document.getElementById("root");
render(() => <SimpleRouter root={App} routes={routes} />, root!);
