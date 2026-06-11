import { useRef } from "react";
import { Button, Flex, Text, useTheme, View } from "@aws-amplify/ui-react";
import { isMobileScreenSize } from "../../helpers/isMobileScreenSize";

interface HeroUploadAreaProps {
  onFilesSelected: (files: FileList) => void;
  onTapCamera: () => void;
  isUploading: boolean;
  activeCount: number;
  errorCount: number;
  onRetry: () => void;
}

export function HeroUploadArea(props: HeroUploadAreaProps) {
  const { tokens } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const btnSize = isMobileScreenSize ? "large" : undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      props.onFilesSelected(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <View
      padding={isMobileScreenSize ? tokens.space.medium : tokens.space.large}
      marginBottom={tokens.space.medium}
      borderRadius="large"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textAlign: "center",
      }}
    >
      <Text color="white" fontWeight="bold" fontSize="large">
        Add your photos &amp; videos
      </Text>
      <input
        ref={fileInputRef}
        id="hero-file-input"
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      />
      <Flex
        justifyContent="center"
        gap={tokens.space.medium}
        marginTop={tokens.space.medium}
      >
        <label
          htmlFor="hero-file-input"
          style={{
            display: "inline-block",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#764ba2",
            fontWeight: "bold",
            padding: isMobileScreenSize ? "12px 24px" : "8px 16px",
            borderRadius: "4px",
            fontSize: isMobileScreenSize ? "16px" : "14px",
          }}
        >
          📁 Choose Files
        </label>
        <Button
          size={btnSize}
          onClick={props.onTapCamera}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "2px solid white",
            fontWeight: "bold",
          }}
        >
          📸 Camera
        </Button>
      </Flex>
      <UploadStatus
        isUploading={props.isUploading}
        activeCount={props.activeCount}
        errorCount={props.errorCount}
        onRetry={props.onRetry}
      />
    </View>
  );
}

function UploadStatus(props: {
  isUploading: boolean;
  activeCount: number;
  errorCount: number;
  onRetry: () => void;
}) {
  const { tokens } = useTheme();

  if (!props.isUploading && props.errorCount === 0) return null;

  return (
    <>
      {props.isUploading && (
        <Text color="white" fontSize="small" marginTop={tokens.space.small}>
          Uploading {props.activeCount} file
          {props.activeCount !== 1 ? "s" : ""}...
        </Text>
      )}
      {props.errorCount > 0 && (
        <Flex
          justifyContent="center"
          alignItems="center"
          gap={tokens.space.xs}
          marginTop={tokens.space.small}
        >
          <Text color="#ffd6d6" fontSize="small">
            {props.errorCount} failed
          </Text>
          <Button
            size="small"
            onClick={props.onRetry}
            style={{ color: "white" }}
          >
            Retry
          </Button>
        </Flex>
      )}
    </>
  );
}
