import { Button, Card, Text, useTheme } from "@aws-amplify/ui-react";
import { Modal } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Schema } from "../../../../amplify/data/resource";
import { ModalImage } from "./ModalImage";
import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";
import { humanFileSize } from "../../../helpers/humanFileSize";

type ImageType = Schema["Image"]["type"];

interface PhotoModalProps {
  image: ImageType | undefined;
  onClose: () => void;
  onBack: (image: ImageType) => void;
  onForward: (image: ImageType) => void;
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
}

const arrowSize = isMobileScreenSize ? "medium" : "large";

export const PhotoModal = ({
  image,
  onClose,
  onBack,
  onForward,
  onDownload,
  onDelete,
}: PhotoModalProps) => {
  const { tokens } = useTheme();

  if (!image) return null;

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.keyCode === 39) onForward(image);
    if (event.keyCode === 37) onBack(image);
  };

  return (
    <Modal open onClose={onClose}>
      <Card
        onKeyUpCapture={handleKeyUp}
        textAlign="center"
        margin={tokens.space.large}
        style={{ verticalAlign: "middle" }}
      >
        <Text>
          <Text as="span" onClick={() => onBack(image)}>
            <ArrowBackIosIcon fontSize={arrowSize} />
          </Text>
          <ModalImage key={image.key} image={image} />
          <Text as="span" onClick={() => onForward(image)}>
            <ArrowForwardIosIcon fontSize={arrowSize} />
          </Text>
          <Button
            display="inline"
            variation="link"
            isFullWidth
            padding={tokens.space.medium}
            onClick={() => onDownload(image.key)}
          >
            download ({humanFileSize(image.size)})
          </Button>
          <Button
            size="small"
            variation="warning"
            colorTheme="warning"
            onClick={() => onDelete(image.key)}
          >
            Delete photo
          </Button>
        </Text>
      </Card>
    </Modal>
  );
};
