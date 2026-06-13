import { Card, Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { detectFileType } from "../../../helpers/detectFileType";
import { getAccelerateUrl } from "../../../helpers/getAccelerateUrl";
import { canPlayVideoFile } from "../../../helpers/videoSupport";
import { VideoFallback } from "./VideoFallback";
import { useInView } from "../../../hooks/useInView";

export const SharedImage = (props: {
  image: Schema["Image"]["type"];
  handleOpenModal: (image: Schema["Image"]["type"]) => void;
}) => {
  const { tokens } = useTheme();
  const { ref, inView } = useInView("300px");
  const [url, setUrl] = useState<URL>();

  useEffect(() => {
    if (!inView) return;
    const fetchUrl = async () => {
      const resolved = await getAccelerateUrl(props.image.key);
      setUrl(resolved);
    };
    fetchUrl();
  }, [inView, props.image.key]);

  const fileType = detectFileType(props.image.key);
  const isUnsupportedVideo =
    fileType === "video" && !canPlayVideoFile(props.image.key);

  const mediaStyle = {
    borderRadius: tokens.radii.large.value,
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover" as const,
  };

  const imageComponent = isUnsupportedVideo ? (
    <VideoFallback
      url={url?.toString()}
      onClick={() => props.handleOpenModal(props.image)}
      style={mediaStyle}
    />
  ) : fileType === "image" ? (
    <Image
      src={url?.toString()}
      style={mediaStyle}
      key={props.image.key}
      alt={props.image.key}
      onClick={() => props.handleOpenModal(props.image)}
      loading="lazy"
    />
  ) : (
    <video
      onClick={() => props.handleOpenModal(props.image)}
      style={mediaStyle}
      controls={true}
      key={props.image.key}
      preload="metadata"
      playsInline={true}
      autoPlay={true}
      loop={true}
      muted={true}
      src={url?.toString()}
    />
  );

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Card
        borderRadius="large"
        variation="elevated"
        backgroundColor={"white"}
        borderColor={"white"}
        boxShadow={"none"}
        width="100%"
        textAlign={"center"}
        padding={tokens.space.xxxs}
        overflow="hidden"
      >
        {url ? imageComponent : <Loader size="large" />}
      </Card>
    </div>
  );
};
