import { Image, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { detectFileType } from "../../../helpers/detectFileType";
import { getAccelerateUrl } from "../../../helpers/getAccelerateUrl";

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

  const imageComponent =
    detectFileType(props.image.key) === "image" ? (
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

  return imageComponent;
};
