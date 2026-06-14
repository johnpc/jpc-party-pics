import { useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { Schema } from "../../amplify/data/resource";
import { useDeleteImage, useImages } from "./useImages";
import { humanFileSize } from "../helpers/humanFileSize";

type ImageType = Schema["Image"]["type"];

export function usePhotoGallery(albumName: string, zipFileEndpoint: string) {
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [openModalImage, setOpenModalImage] = useState<ImageType>();

  const { data: images = [], isLoading } = useImages(albumName);
  const deleteImageMutation = useDeleteImage(albumName);

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

  const deleteFile = async (key: string) => {
    const confirmed = confirm(
      "Are you sure you want to remove this photo from the album?",
    );
    if (!confirmed) return;

    await deleteImageMutation.mutateAsync(key);
    setOpenModalImage(undefined);
  };

  const downloadAll = async () => {
    const totalSize = images.reduce((acc, image) => acc + image.size, 0);
    const confirmed = confirm(
      `Are you sure? This will download ${humanFileSize(totalSize)}`,
    );
    if (!confirmed) return;

    setDownloadAllLoading(true);
    try {
      const zipFileResponse = await fetch(zipFileEndpoint, {
        method: "POST",
        body: JSON.stringify({ albumName }),
      });
      const zipFileResult = await zipFileResponse.json();
      await downloadFile(zipFileResult.key ?? zipFileResult.data!.key);
    } catch (error) {
      alert(`Error downloading zip file: ${(error as Error).message}`);
      console.error(error);
    }
    setDownloadAllLoading(false);
  };

  const handleClose = () => setOpenModalImage(undefined);

  const handleOpenModal = (image: ImageType) => setOpenModalImage(image);

  const handleBackImage = (image: ImageType) => {
    const index = images.findIndex((i) => i.key === image.key);
    const backIndex = index === 0 ? images.length - 1 : index - 1;
    handleOpenModal(images[backIndex]);
  };

  const handleForwardImage = (image: ImageType) => {
    const index = images.findIndex((i) => i.key === image.key);
    const forwardIndex = index === images.length - 1 ? 0 : index + 1;
    handleOpenModal(images[forwardIndex]);
  };

  return {
    images,
    isLoading,
    downloadAllLoading,
    openModalImage,
    downloadFile,
    deleteFile,
    downloadAll,
    handleClose,
    handleOpenModal,
    handleBackImage,
    handleForwardImage,
  };
}
