import { Heading, useTheme } from "@aws-amplify/ui-react";
import { KioskSharedPhotos } from "./PartyPicsAlbum/SharedPhotos/KioskSharedPhotos";

export const Kiosk = (props: { albumName: string }) => {
  const { tokens } = useTheme();

  return (
    <div style={{ 
      maxWidth: "100%", 
      padding: tokens.space.small.value,
      margin: 0 
    }}>
      <Heading level={1} textAlign="center" marginBottom={tokens.space.small}>
        {props.albumName}
      </Heading>
      <KioskSharedPhotos albumName={props.albumName} />
    </div>
  );
};
