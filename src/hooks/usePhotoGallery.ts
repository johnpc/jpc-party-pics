import { useState } from "react";
import { backend } from "../backend";
import { ImageRecord } from "../backend/types";
import { useDeleteImage, useImages } from "./useImages";
import { humanFileSize } from "../helpers/humanFileSize";
import { Lightbox, closed, neighborKey, open } from "../helpers/lightbox";

// @state-machine download-all
// idle ⇄ zipping (the Download All button); errors surface via alert and
// return to idle. The lightbox machine lives in helpers/lightbox.ts.
export function usePhotoGallery(albumName: string) {
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [lightbox, setLightbox] = useState<Lightbox>(closed);

  const { data: images = [], isLoading } = useImages(albumName);
  const deleteImageMutation = useDeleteImage(albumName);

  // Derived: the open image is looked up in the live list every render.
  const openModalImage =
    lightbox.kind === "open"
      ? images.find((i) => i.key === lightbox.key)
      : undefined;

  const downloadFile = async (key: string) => {
    const url = await backend.getUrl(key, {
      validateObjectExistence: true,
      expiresIn: 300,
    });
    window.open(url, "_blank");
  };

  const deleteFile = async (key: string) => {
    const confirmed = confirm(
      "Are you sure you want to remove this photo from the album?",
    );
    if (!confirmed) return;

    await deleteImageMutation.mutateAsync(key);
    setLightbox(closed);
  };

  const downloadAll = async () => {
    const totalSize = images.reduce((acc, image) => acc + image.size, 0);
    const confirmed = confirm(
      `Are you sure? This will download ${humanFileSize(totalSize)}`,
    );
    if (!confirmed) return;

    setDownloadAllLoading(true);
    try {
      const zip = await backend.requestZip(albumName);
      await downloadFile(zip.key);
    } catch (error) {
      alert(`Error downloading zip file: ${(error as Error).message}`);
      console.error(error);
    }
    setDownloadAllLoading(false);
  };

  const step = (image: ImageRecord, direction: "back" | "forward") => {
    const keys = images.map((i) => i.key);
    const next = neighborKey(keys, image.key, direction);
    setLightbox(next === undefined ? closed : open(next));
  };

  return {
    images,
    isLoading,
    downloadAllLoading,
    openModalImage,
    downloadFile,
    deleteFile,
    downloadAll,
    handleClose: () => setLightbox(closed),
    handleOpenModal: (image: ImageRecord) => setLightbox(open(image.key)),
    handleBackImage: (image: ImageRecord) => step(image, "back"),
    handleForwardImage: (image: ImageRecord) => step(image, "forward"),
  };
}
