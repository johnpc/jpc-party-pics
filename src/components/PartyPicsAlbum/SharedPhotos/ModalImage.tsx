import { Image, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { mediaKind } from "../../../helpers/mediaKind";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";
import { VideoFallback } from "./VideoFallback";
import { useImageUrl } from "../../../hooks/useImageUrl";
import { useImageZoom } from "../../../hooks/useImageZoom";

const mediaStyle = isMobileScreenSize
  ? { width: "100%", maxHeight: "70vh", objectFit: "contain" as const }
  : {
      width: "80%",
      maxHeight: "50vh",
      objectFit: "contain" as const,
      verticalAlign: "middle" as const,
    };

export const ModalImage = (props: { image: Schema["Image"]["type"] }) => {
  const { tokens } = useTheme();
  const url = useImageUrl(props.image.key, true, "full");
  const zoom = useImageZoom();

  const kind = mediaKind(props.image.key);

  if (kind === "unsupported-video") {
    return (
      <VideoFallback url={url} style={{ width: "80%", maxHeight: "50vh" }} />
    );
  }

  return kind === "image" ? (
    <Image
      src={url}
      style={{
        borderRadius: tokens.radii.large.value,
        ...mediaStyle,
        ...zoom.style,
      }}
      key={props.image.key}
      alt={props.image.key}
      onDoubleClick={zoom.onDoubleClick}
      onTouchStart={zoom.onTouchStart}
      onTouchMove={zoom.onTouchMove}
      onTouchEnd={zoom.onTouchEnd}
    />
  ) : (
    <video
      style={{ borderRadius: tokens.radii.large.value, ...mediaStyle }}
      controls={true}
      key={props.image.key}
      preload="auto"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url}
    />
  );
};
