import { Button, Flex, Text, useTheme } from "@aws-amplify/ui-react";
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
        style={
          isMobileScreenSize
            ? {
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.95)",
                outline: "none",
              }
            : {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                borderRadius: tokens.radii.large.value,
                padding: tokens.space.medium.value,
                maxWidth: "90vw",
                maxHeight: "90vh",
                outline: "none",
              }
        }
      >
        <Flex
          justifyContent="flex-end"
          width="100%"
          padding={tokens.space.small}
        >
          <Button
            size="small"
            onClick={onClose}
            style={
              isMobileScreenSize
                ? { color: "white", borderColor: "rgba(255,255,255,0.3)" }
                : undefined
            }
          >
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
          <Text
            as="span"
            onClick={() => onBack(image)}
            style={{
              cursor: "pointer",
              padding: "1rem 0.5rem",
              color: isMobileScreenSize ? "white" : undefined,
            }}
          >
            <ArrowBackIosIcon
              fontSize={isMobileScreenSize ? "large" : "medium"}
            />
          </Text>

          <ModalImage key={image.key} image={image} />

          <Text
            as="span"
            onClick={() => onForward(image)}
            style={{
              cursor: "pointer",
              padding: "1rem 0.5rem",
              color: isMobileScreenSize ? "white" : undefined,
            }}
          >
            <ArrowForwardIosIcon
              fontSize={isMobileScreenSize ? "large" : "medium"}
            />
          </Text>
        </Flex>

        <Flex
          gap={tokens.space.medium}
          padding={tokens.space.small}
          justifyContent="center"
          style={
            isMobileScreenSize
              ? { paddingBottom: "env(safe-area-inset-bottom, 16px)" }
              : undefined
          }
        >
          <Button
            variation="link"
            size="small"
            onClick={() => onDownload(image.key)}
            style={isMobileScreenSize ? { color: "white" } : undefined}
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
