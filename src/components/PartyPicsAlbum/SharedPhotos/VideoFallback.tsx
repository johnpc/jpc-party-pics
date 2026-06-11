import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { CSSProperties } from "react";

interface VideoFallbackProps {
  url?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export const VideoFallback = ({ url, onClick, style }: VideoFallbackProps) => {
  const { tokens } = useTheme();

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      onClick={onClick}
      style={{
        borderRadius: tokens.radii.large.value,
        backgroundColor: "#1a1a2e",
        cursor: onClick ? "pointer" : undefined,
        minHeight: "120px",
        width: "100%",
        ...style,
      }}
    >
      <Text fontSize="2rem">🎬</Text>
      {url ? (
        <Text
          as="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          color="white"
          fontSize={tokens.fontSizes.xs}
          style={{ textDecoration: "underline" }}
        >
          Download to view
        </Text>
      ) : (
        <Text color="white" fontSize={tokens.fontSizes.xs}>
          Video unavailable
        </Text>
      )}
    </Flex>
  );
};
