import {
  Heading,
  Loader,
  useTheme,
} from "@aws-amplify/ui-react";
import { KioskImage } from "./KioskImage";
import { useImages } from "../../../hooks/useImages";

export const KioskSharedPhotos = (props: { albumName: string }) => {
  const { tokens } = useTheme();
  const { data: images = [], isLoading } = useImages(props.albumName);

  if (isLoading) {
    return <Loader variation="linear" />;
  }

  if (images.length === 0) {
    return (
      <Heading level={4} textAlign="center">
        No photos yet
      </Heading>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: tokens.space.xs.value,
      width: "100%",
    }}>
      {images.map((image) => (
        <KioskImage
          image={image}
          key={image.key}
        />
      ))}
    </div>
  );
};
