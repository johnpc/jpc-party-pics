import { Card, Image, Loader, useTheme } from "@aws-amplify/ui-react";
import { Schema } from "../../../../amplify/data/resource";
import { getUrl } from "aws-amplify/storage";
import { useEffect, useState } from "react";

const getAccelerateUrl = async (key: string): Promise<URL> => {
  const url = await getUrl({
    path: key,
    options: {
      // ensure object exists before getting url
      validateObjectExistence: false,
      // url expiration time in seconds.
      expiresIn: 300,
      // whether to use accelerate endpoint
      useAccelerateEndpoint: true,
    },
  });
  return url.url;
};

export const SharedImage = (props: {
  image: Schema["Image"]["type"];
  isMobileScreenSize: boolean;
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
  }, []);

  return (
    <Card
      borderRadius="large"
      variation="elevated"
      backgroundColor={"white"}
      borderColor={"white"}
      boxShadow={"none"}
      width={props.isMobileScreenSize ? "45%" : undefined}
      textAlign={"center"}
      padding={tokens.space.xxxs}
    >
      {" "}
      {url ? (
        <Image
          src={url.toString()}
          style={{
            borderRadius: tokens.radii.large.value,
            height: "100%",
            maxHeight: "30vh",
            objectFit: "cover",
          }}
          key={props.image.key}
          alt={props.image.key}
          onClick={() => props.handleOpenModal(props.image)}
        />
      ) : (
        <Loader size="large" />
      )}
    </Card>
  );
};
