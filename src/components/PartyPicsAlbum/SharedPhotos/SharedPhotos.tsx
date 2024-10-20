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
import { StorageImage } from "@aws-amplify/ui-react-storage";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const client = generateClient<Schema>();
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

import { getUrl } from "aws-amplify/storage";
import { Modal } from "@mui/material";
import { SharedImage } from "./SharedImage";

const downloadFile = async (key: string) => {
  const url = await getUrl({
    path: key,
    options: {
      // ensure object exists before getting url
      validateObjectExistence: true,
      // url expiration time in seconds.
      expiresIn: 300,
      // whether to use accelerate endpoint
      useAccelerateEndpoint: true,
    },
  });
  window.open(url.url, "_blank");
};

export const SharedPhotos = (props: {
  lastUploadTime: Date;
  albumName: string;
}) => {
  const { tokens } = useTheme();
  const [images, setImages] = useState<Schema["Image"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [lastDeleteTime, setLastDeleteTime] = useState(new Date());
  const [openModalImage, setOpenModalImage] =
    useState<Schema["Image"]["type"]>();
  const isMobileScreenSize = document.documentElement.clientWidth < 1000;
  useEffect(() => {
    setLoading(true);
    const fetchImages = async () => {
      const response = await client.queries.getPartyPicsImages({
        albumName: props.albumName,
      });
      const images = response.data?.images ?? [];
      setImages(images);
      setLoading(false);
    };
    fetchImages();
  }, [lastDeleteTime, props.albumName, props.lastUploadTime]);

  useEffect(() => {
    const createListener = client.models.AlbumImageKey.onCreate().subscribe({
      next: async () => {
        setLastDeleteTime(new Date());
      },
      error: (error: Error) => {
        console.error("Subscription error", error);
      },
    })
    const deleteListener = client.models.AlbumImageKey.onDelete().subscribe({
      next: async () => {
        setLastDeleteTime(new Date());
      },
      error: (error: Error) => {
        console.error("Subscription error", error);
      },
    })
    return () => {
      deleteListener.unsubscribe();
      createListener.unsubscribe();
    }
  }, [images])

  const deleteFile = async (key: string) => {
    const confirmed = confirm(
      `Are you sure? This action is destructive. The image can never be recovered.`,
    );
    if (!confirmed) return;

    await client.queries.deletePartyPic({ key });
    await client.models.AlbumImageKey.delete({ imageKey: key })
    setLastDeleteTime(new Date());
    setOpenModalImage(undefined);
  };

  const downloadAll = async () => {
    const confirmed = confirm(
      `Are you sure? This will download ${humanFileSize(images.reduce((acc, image) => acc + image.size, 0))}`,
    );
    if (!confirmed) return;

    setDownloadAllLoading(true);
    const zipFileResult = await client.queries.getPartyPicsZipFile({
      albumName: props.albumName,
    });
    await downloadFile(zipFileResult.data!.key);
    setDownloadAllLoading(false);
  };

  const handleClose = () => {
    setOpenModalImage(undefined);
  };

  const handleOpenModal = (image: Schema["Image"]["type"]) => {
    setOpenModalImage(image);
  };

  const handleBackImage = (image: Schema["Image"]["type"]) => {
    const index = images.indexOf(image);
    const backIndex = index === 0 ? images.length - 1 : index - 1;
    handleOpenModal(images[backIndex]);
  };

  const handleForwardImage = (image: Schema["Image"]["type"]) => {
    const index = images.indexOf(image);
    const forwardIndex = index === images.length - 1 ? 0 : index + 1;
    handleOpenModal(images[forwardIndex]);
  };

  images.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
            <StorageImage
              style={{
                width: "80%",
                height: "80%",
                maxHeight: "80vh",
                objectFit: "contain",
                verticalAlign: "middle",
              }}
              key={openModalImage?.key ?? ""}
              alt={openModalImage?.key ?? ""}
              path={openModalImage?.key ?? ""}
            />{" "}
            <Text as="span" onClick={() => handleForwardImage(openModalImage!)}>
              <ArrowForwardIosIcon
                fontSize={isMobileScreenSize ? "medium" : "large"}
              />
            </Text>
            <Button
              isFullWidth
              variation="link"
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
          loading ? (
            <Loader variation="linear" />
          ) : (
            <Heading level={4} textAlign="center">
              No photos yet
            </Heading>
          )
        }
      >
        {(image, index) => (
          <SharedImage
            image={image}
            key={index}
            isMobileScreenSize={isMobileScreenSize}
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
            <Loader /> This could take a while...
          </>
        ) : (
          <>
            Download All (
            {humanFileSize(images.reduce((acc, image) => acc + image.size, 0))})
          </>
        )}
      </Button>
    </>
  );
};
