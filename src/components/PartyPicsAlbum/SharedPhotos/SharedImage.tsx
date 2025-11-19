import { Card, Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { useEffect, useState } from "react";
import { detectFileType } from "../../../helpers/detectFileType";
import { getAccelerateUrl } from "../../../helpers/getAccelerateUrl";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";

export const SharedImage = (props: {
  image: Schema["Image"]["type"];
  handleOpenModal: (image: Schema["Image"]["type"]) => void;
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

  const imageComponent =
    detectFileType(props.image.key) === "image" ? (
      <Image
        src={url?.toString()}
        style={{
          borderRadius: tokens.radii.large.value,
          height: "100%",
          maxHeight: "30vh",
          objectFit: "cover",
        }}
        key={props.image.key}
        alt={props.image.key}
        onClick={() => props.handleOpenModal(props.image)}
        loading="lazy"
      />
    ) : (
      <video
        onClick={() => props.handleOpenModal(props.image)}
        style={{
          borderRadius: tokens.radii.large.value,
          height: "100%",
          maxHeight: "30vh",
          objectFit: "cover",
        }}
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
    <Card
      borderRadius="large"
      variation="elevated"
      backgroundColor={"white"}
      borderColor={"white"}
      boxShadow={"none"}
      width={isMobileScreenSize ? "45%" : undefined}
      textAlign={"center"}
      padding={tokens.space.xxxs}
    >
      {url ? imageComponent : <Loader size="large" />}
    </Card>
  );
};
