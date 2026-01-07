import { Divider, Heading, useTheme } from "@aws-amplify/ui-react";
import { SharedPhotos } from "./PartyPicsAlbum/SharedPhotos/SharedPhotos";

export const Kiosk = (props: { albumName: string }) => {
  const { tokens } = useTheme();

  return (
    <>
      <Heading level={2} textAlign="center" marginBottom={tokens.space.medium}>
        {props.albumName}
      </Heading>
      <Divider marginBottom={tokens.space.medium} />
      <SharedPhotos albumName={props.albumName} />
    </>
  );
};
