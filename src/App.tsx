import "@aws-amplify/ui-react/styles.css";
import "./App.css";
import { Suspense, lazy } from "react";
import { PartyPicsAlbum } from "./components/PartyPicsAlbum/PartyPicsAlbum";
import { CreateAlbum } from "./components/CreateAlbum";
import { Header } from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OfflineBanner } from "./components/OfflineBanner";
import { Divider, Loader, useTheme } from "@aws-amplify/ui-react";
import { Route, parseRoute } from "./helpers/route";

const Camera = lazy(() =>
  import("./components/Camera/Camera").then((m) => ({ default: m.Camera })),
);
const Kiosk = lazy(() =>
  import("./components/Kiosk").then((m) => ({ default: m.Kiosk })),
);

function Screen({ route }: { route: Route }) {
  switch (route.kind) {
    case "home":
      return <CreateAlbum />;
    case "camera":
      return (
        <Suspense fallback={<Loader variation="linear" />}>
          <Camera albumName={route.albumName} />
        </Suspense>
      );
    case "kiosk":
      return (
        <Suspense fallback={<Loader variation="linear" />}>
          <Kiosk albumName={route.albumName} />
        </Suspense>
      );
    case "album":
      return <PartyPicsAlbum albumName={route.albumName} />;
  }
}

function App() {
  const { tokens } = useTheme();
  const route = parseRoute(window.location.pathname);

  return (
    <>
      <OfflineBanner />
      <Header />
      <Divider
        style={{ visibility: "hidden" }}
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
      />
      <ErrorBoundary>
        <Screen route={route} />
      </ErrorBoundary>
    </>
  );
}

export default App;
