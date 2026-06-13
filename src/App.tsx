import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { Suspense, lazy } from "react";
import { Amplify } from "aws-amplify";
import config from "../amplify_outputs.json";
import { PartyPicsAlbum } from "./components/PartyPicsAlbum/PartyPicsAlbum";
import { CreateAlbum } from "./components/CreateAlbum";
import { Header } from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Divider, Loader, useTheme } from "@aws-amplify/ui-react";

const Camera = lazy(() =>
  import("./components/Camera/Camera").then((m) => ({ default: m.Camera })),
);
const Kiosk = lazy(() =>
  import("./components/Kiosk").then((m) => ({ default: m.Kiosk })),
);

Amplify.configure(config);
function App() {
  const { tokens } = useTheme();

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const albumName = pathParts[0];
  const isCamera = pathParts[1] === "camera";
  const isKiosk = pathParts[1] === "kiosk";

  return (
    <>
      <Header />
      <Divider
        style={{ visibility: "hidden" }}
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
      />
      <ErrorBoundary>
        {!albumName ? (
          <CreateAlbum />
        ) : isCamera ? (
          <Suspense fallback={<Loader variation="linear" />}>
            <Camera albumName={albumName} />
          </Suspense>
        ) : isKiosk ? (
          <Suspense fallback={<Loader variation="linear" />}>
            <Kiosk albumName={albumName} />
          </Suspense>
        ) : (
          <PartyPicsAlbum albumName={albumName} />
        )}
      </ErrorBoundary>
    </>
  );
}

export default App;
