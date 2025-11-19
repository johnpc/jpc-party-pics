import {
  Button,
  Card,
  Collection,
  Divider,
  Heading,
  Loader,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { custom } from "../../../../amplify_outputs.json";
import { getUrl } from "aws-amplify/storage";
import { Modal } from "@mui/material";
import { SharedImage } from "./SharedImage";
import { ModalImage } from "./ModalImage";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";
import { useDeleteImage, useImages } from "../../../hooks/useImages";

const itemsPerPage = 24;

function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

const downloadFile = async (key: string) => {
  const url = await getUrl({
    path: key,
    options: {
      validateObjectExistence: true,
      expiresIn: 300,
      useAccelerateEndpoint: true,
    },
  });
  window.open(url.url, "_blank");
};

export const SharedPhotos = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [openModalImage, setOpenModalImage] =
    useState<Schema["Image"]["type"]>();

  const { data: images = [], isLoading } = useImages(props.albumName);
  const deleteImage = useDeleteImage(props.albumName);

  const deleteFile = async (key: string) => {
    const confirmed = confirm(
      `Are you sure? This action is destructive. The image can never be recovered.`
    );
    if (!confirmed) return;

    await deleteImage.mutateAsync(key);
    setOpenModalImage(undefined);
  };

  const downloadAll = async () => {
    const confirmed = confirm(
      `Are you sure? This will download ${humanFileSize(images.reduce((acc, image) => acc + image.size, 0))}`
    );
    if (!confirmed) return;

    setDownloadAllLoading(true);
    try {
      const zipFileResponse = await fetch(custom.zipFileEndpoint, {
        method: "POST",
        body: JSON.stringify({ albumName: props.albumName }),
      });
      const zipFileResult = await zipFileResponse.json();
      await downloadFile(zipFileResult.key ?? zipFileResult.data!.key);
    } catch (error) {
      alert(`Error downloading zip file: ${(error as Error).message}`);
      console.error(error);
    }
    setDownloadAllLoading(false);
  };

  const handleClose = () => {
    setOpenModalImage(undefined);
  };

  const handleOpenModal = (image: Schema["Image"]["type"]) => {
    setOpenModalImage(image);
  };

  const handleBackImage = (image: Schema["Image"]["type"]) => {
    const index = images.findIndex((i) => i.key === image.key);
    const backIndex = index === 0 ? images.length - 1 : index - 1;
    handleOpenModal(images[backIndex]);
  };

  const handleForwardImage = (image: Schema["Image"]["type"]) => {
    const index = images.findIndex((i) => i.key === image.key);
    const forwardIndex = index === images.length - 1 ? 0 : index + 1;
    handleOpenModal(images[forwardIndex]);
  };

  return (
    <>
      <Modal
        open={!!openModalImage}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card
          onKeyUpCapture={(event) => {
            if (event.keyCode === 39) {
              handleForwardImage(openModalImage!);
            }
            if (event.keyCode === 37) {
              handleBackImage(openModalImage!);
            }
          }}
          textAlign={"center"}
          margin={tokens.space.large}
          style={{ verticalAlign: "middle" }}
        >
          <Text id="modal-modal-description">
            <Text as="span" onClick={() => handleBackImage(openModalImage!)}>
              <ArrowBackIosIcon
                fontSize={isMobileScreenSize ? "medium" : "large"}
              />
            </Text>
            <ModalImage key={openModalImage?.key} image={openModalImage!} />{" "}
            <Text as="span" onClick={() => handleForwardImage(openModalImage!)}>
              <ArrowForwardIosIcon
                fontSize={isMobileScreenSize ? "medium" : "large"}
              />
            </Text>
            <Button
              display={"inline"}
              variation="link"
              isFullWidth
              padding={tokens.space.medium}
              onClick={() => downloadFile(openModalImage?.key ?? "")}
            >
              download ({humanFileSize(openModalImage?.size ?? 0)})
            </Button>
            <Button
              size="small"
              variation="warning"
              colorTheme="warning"
              onClick={() => deleteFile(openModalImage?.key ?? "")}
            >
              Delete photo
            </Button>
          </Text>
        </Card>
      </Modal>
      <Text fontSize={"large"}>Photos shared to album "{props.albumName}"</Text>
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        style={{ visibility: "hidden" }}
      />
      <Collection
        items={images}
        key={images.length.toFixed()}
        type="list"
        direction="row"
        gap={tokens.space.medium}
        paddingLeft={tokens.space.medium}
        textAlign={"center"}
        wrap="wrap"
        width={"100%"}
        isPaginated={images.length > itemsPerPage}
        itemsPerPage={itemsPerPage}
        searchNoResultsFound={
          isLoading ? (
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
            handleOpenModal={handleOpenModal}
          />
        )}
      </Collection>
      <Button
        variation="primary"
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
        isFullWidth={isMobileScreenSize}
        padding={tokens.space.medium}
        onClick={() => downloadAll()}
      >
        {downloadAllLoading ? (
          <>
            <Loader marginRight={tokens.space.small} /> This could take a
            while...
          </>
        ) : (
          <>
            Download All {images.length} files (
            {humanFileSize(images.reduce((acc, image) => acc + image.size, 0))})
          </>
        )}
      </Button>
    </>
  );
};
