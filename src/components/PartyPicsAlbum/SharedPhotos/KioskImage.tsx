import { Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { detectFileType } from "../../../helpers/detectFileType";
import { getAccelerateUrl } from "../../../helpers/getAccelerateUrl";

export const KioskImage = (props: {
  image: Schema["Image"]["type"];
}) => {
  const { tokens } = useTheme();
  const [url, setUrl] = useState<URL>();
  useEffect(() => {
    const fetchUrl = async () => {
      const url = await getAccelerateUrl(props.image.key);
      setUrl(url);
    };
    fetchUrl();
  }, [props.image.key]);

  if (!url) {
    return <Loader size="small" />;
  }

  return detectFileType(props.image.key) === "image" ? (
    <Image
      src={url.toString()}
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
      src={url.toString()}
    />
  );
};
