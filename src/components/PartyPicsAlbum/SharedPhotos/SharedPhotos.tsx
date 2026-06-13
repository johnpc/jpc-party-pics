import {
  Button,
  Collection,
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
      {!isMobileScreenSize && (
        <Text fontSize="large" marginBottom={tokens.space.medium}>
          Photos shared to album &quot;{props.albumName}&quot;
        </Text>
      )}
      <Collection
        items={gallery.images}
        key={gallery.images.length.toFixed()}
        type="list"
        direction="row"
        gap={isMobileScreenSize ? tokens.space.small : tokens.space.medium}
        textAlign="center"
        wrap="wrap"
        width="100%"
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
        marginBottom={tokens.space.large}
        isFullWidth={isMobileScreenSize}
        className="download-all-btn"
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
