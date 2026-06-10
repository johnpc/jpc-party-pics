import {
  Button,
  Collection,
  Divider,
  Heading,
  Loader,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { custom } from "../../../../amplify_outputs.json";
import { SharedImage } from "./SharedImage";
import { PhotoModal } from "./PhotoModal";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";
import { humanFileSize } from "../../../helpers/humanFileSize";
import { usePhotoGallery } from "../../../hooks/usePhotoGallery";

const itemsPerPage = 24;

export const SharedPhotos = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const gallery = usePhotoGallery(props.albumName, custom.zipFileEndpoint);

  return (
    <>
      <PhotoModal
        image={gallery.openModalImage}
        onClose={gallery.handleClose}
        onBack={gallery.handleBackImage}
        onForward={gallery.handleForwardImage}
        onDownload={gallery.downloadFile}
        onDelete={gallery.deleteFile}
      />
      <Text fontSize={"large"}>Photos shared to album "{props.albumName}"</Text>
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        style={{ visibility: "hidden" }}
      />
      <Collection
        items={gallery.images}
        key={gallery.images.length.toFixed()}
        type="list"
        direction="row"
        gap={tokens.space.medium}
        paddingLeft={tokens.space.medium}
        textAlign={"center"}
        wrap="wrap"
        width={"100%"}
        isPaginated={gallery.images.length > itemsPerPage}
        itemsPerPage={itemsPerPage}
        searchNoResultsFound={
          gallery.isLoading ? (
            <Loader variation="linear" />
          ) : (
            <Heading level={4} textAlign="center">
              No photos yet
            </Heading>
          )
        }
      >
        {(image) => (
          <SharedImage
            image={image}
            key={image.key}
            handleOpenModal={gallery.handleOpenModal}
          />
        )}
      </Collection>
      <Button
        variation="primary"
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        isFullWidth={isMobileScreenSize}
        padding={tokens.space.medium}
        onClick={gallery.downloadAll}
      >
        {gallery.downloadAllLoading ? (
          <>
            <Loader marginRight={tokens.space.small} /> This could take a
            while...
          </>
        ) : (
          <>
            Download All {gallery.images.length} files (
            {humanFileSize(
              gallery.images.reduce((acc, image) => acc + image.size, 0),
            )}
            )
          </>
        )}
      </Button>
    </>
  );
};
