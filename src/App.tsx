import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplify_outputs.json";
import { PartyPicsAlbum } from "./components/PartyPicsAlbum/PartyPicsAlbum";
import { CreateAlbum } from "./components/CreateAlbum";
import { Camera } from "./components/Camera/Camera";
import { Header } from "./components/Header";
import { Divider, useTheme } from "@aws-amplify/ui-react";
Amplify.configure(config);
function App() {
  const { tokens } = useTheme();

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const albumName = pathParts[0];
  const isCamera = pathParts[1] === "camera";

  return (
    <>
      <Header />
      <Divider
        style={{ visibility: "hidden" }}
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
      />
      {!albumName ? (
        <CreateAlbum />
      ) : isCamera ? (
        <Camera albumName={albumName} />
      ) : (
        <PartyPicsAlbum albumName={albumName} />
      )}
    </>
  );
}

export default App;
