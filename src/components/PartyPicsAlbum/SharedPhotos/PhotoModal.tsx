import { Button, Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { Modal } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Schema } from "../../../../amplify/data/resource";
import { ModalImage } from "./ModalImage";
import { humanFileSize } from "../../../helpers/humanFileSize";
import {
  getContainerStyle,
  getCloseButtonStyle,
  getArrowStyle,
  getArrowSize,
  getFooterStyle,
  getDownloadButtonStyle,
} from "./photoModalStyles";

type ImageType = Schema["Image"]["type"];

interface PhotoModalProps {
  image: ImageType | undefined;
  onClose: () => void;
  onBack: (image: ImageType) => void;
  onForward: (image: ImageType) => void;
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
}

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
      <Flex
        onKeyUpCapture={handleKeyUp}
        direction="column"
        alignItems="center"
        justifyContent="space-between"
        style={getContainerStyle(tokens)}
      >
        <Flex
          justifyContent="flex-end"
          width="100%"
          padding={tokens.space.small}
        >
          <Button size="small" onClick={onClose} style={getCloseButtonStyle()}>
            ✕
          </Button>
        </Flex>

        <Flex
          alignItems="center"
          justifyContent="center"
          flex="1"
          width="100%"
          gap={tokens.space.xs}
        >
          <Text as="span" onClick={() => onBack(image)} style={getArrowStyle()}>
            <ArrowBackIosIcon fontSize={getArrowSize()} />
          </Text>

          <ModalImage key={image.key} image={image} />

          <Text
            as="span"
            onClick={() => onForward(image)}
            style={getArrowStyle()}
          >
            <ArrowForwardIosIcon fontSize={getArrowSize()} />
          </Text>
        </Flex>

        <Flex
          gap={tokens.space.medium}
          padding={tokens.space.small}
          justifyContent="center"
          style={getFooterStyle()}
        >
          <Button
            variation="link"
            size="small"
            onClick={() => onDownload(image.key)}
            style={getDownloadButtonStyle()}
          >
            ↓ Download ({humanFileSize(image.size)})
          </Button>
          <Button
            size="small"
            variation="warning"
            colorTheme="warning"
            onClick={() => onDelete(image.key)}
          >
            Delete
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
