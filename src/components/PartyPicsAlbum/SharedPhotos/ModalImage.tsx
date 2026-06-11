import { Image, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { detectFileType } from "../../../helpers/detectFileType";
import { getAccelerateUrl } from "../../../helpers/getAccelerateUrl";
import { canPlayVideoFile } from "../../../helpers/videoSupport";
import { VideoFallback } from "./VideoFallback";

export const ModalImage = (props: { image: Schema["Image"]["type"] }) => {
  const { tokens } = useTheme();
  const [url, setUrl] = useState<URL>();
  useEffect(() => {
    const fetchUrl = async () => {
      const url = await getAccelerateUrl(props.image.key);
      setUrl(url);
    };
    fetchUrl();
  }, []);

  const fileType = detectFileType(props.image.key);
  const isUnsupportedVideo =
    fileType === "video" && !canPlayVideoFile(props.image.key);

  if (isUnsupportedVideo) {
    return (
      <VideoFallback
        url={url?.toString()}
        style={{ width: "80%", maxHeight: "50vh" }}
      />
    );
  }

  return fileType === "image" ? (
    <Image
      src={url?.toString()}
      style={{
        borderRadius: tokens.radii.large.value,
        width: "80%",
        height: "80%",
        maxHeight: "50vh",
        objectFit: "contain",
        verticalAlign: "middle",
      }}
      key={props.image.key}
      alt={props.image.key}
    />
  ) : (
    <video
      style={{
        borderRadius: tokens.radii.large.value,
        width: "80%",
        height: "80%",
        maxHeight: "50vh",
        objectFit: "contain",
        verticalAlign: "middle",
      }}
      controls={true}
      key={props.image.key}
      preload="auto"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url?.toString()}
    />
  );
};
