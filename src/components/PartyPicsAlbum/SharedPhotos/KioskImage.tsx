import { Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { mediaKind } from "../../../helpers/mediaKind";
import { VideoFallback } from "./VideoFallback";
import { useImageUrl } from "../../../hooks/useImageUrl";

export const KioskImage = (props: { image: Schema["Image"]["type"] }) => {
  const { tokens } = useTheme();
  const url = useImageUrl(props.image.key, true);

  if (!url) {
    return <Loader size="small" />;
  }

  const kind = mediaKind(props.image.key);

  if (kind === "unsupported-video") {
    return <VideoFallback url={url} style={{ height: "auto" }} />;
  }

  return kind === "image" ? (
    <Image
      src={url}
      style={{
        borderRadius: tokens.radii.small.value,
        width: "100%",
        height: "auto",
        objectFit: "contain",
      }}
      key={props.image.key}
      alt={props.image.key}
      loading="lazy"
    />
  ) : (
    <video
      style={{
        borderRadius: tokens.radii.small.value,
        width: "100%",
        height: "auto",
        objectFit: "contain",
      }}
      controls={false}
      key={props.image.key}
      preload="metadata"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url}
    />
  );
};
