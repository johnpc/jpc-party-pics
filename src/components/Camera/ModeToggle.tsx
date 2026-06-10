import { Button, Flex } from "@aws-amplify/ui-react";

interface ModeToggleProps {
  mode: "photo" | "video";
  onSetMode: (mode: "photo" | "video") => void;
}

export const ModeToggle = ({ mode, onSetMode }: ModeToggleProps) => (
  <Flex gap="0.5rem">
    <Button
      variation={mode === "photo" ? "primary" : "link"}
      onClick={() => onSetMode("photo")}
      size="small"
    >
      Photo
    </Button>
    <Button
      variation={mode === "video" ? "primary" : "link"}
      onClick={() => onSetMode("video")}
      size="small"
    >
      Video
    </Button>
  </Flex>
);
