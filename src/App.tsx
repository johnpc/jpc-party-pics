import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import config from "../amplify_outputs.json";
import { PartyPicsAlbum } from "./components/PartyPicsAlbum";
import { CreateAlbum } from "./components/CreateAlbum";
import { Header } from "./components/Header";
import { Divider, useTheme } from "@aws-amplify/ui-react";
Amplify.configure(config);
function App() {
  const { tokens } = useTheme();

  const albumName = window.location.pathname.split("/")[1];
  console.log({ albumName });
  return (
    <>
      <Header />
      <Divider
        style={{ visibility: "hidden" }}
        marginTop={tokens.space.small}
        marginBottom={tokens.space.small}
      />
      {albumName ? <PartyPicsAlbum albumName={albumName} /> : <CreateAlbum />}
    </>
  );
}

export default App;
