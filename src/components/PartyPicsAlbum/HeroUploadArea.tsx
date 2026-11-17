import { Button, Flex, Text, useTheme, View } from "@aws-amplify/ui-react";
import { isMobileScreenSize } from "../../helpers/isMobileScreenSize";

interface HeroUploadAreaProps {
  onFilesSelected: (files: FileList) => void;
  onTapCamera: () => void;
  isUploading: boolean;
  activeCount: number;
  /** Failed uploads the Retry button can still re-queue. */
  retryableCount: number;
  /** Failed uploads whose retry budget is spent; only re-selecting helps. */
  exhaustedCount: number;
  onRetry: () => void;
}

export function HeroUploadArea(props: HeroUploadAreaProps) {
  const { tokens } = useTheme();
  const btnSize = isMobileScreenSize ? "large" : undefined;
  const btnPad = isMobileScreenSize ? "12px 24px" : "8px 16px";

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
      <Flex
        justifyContent="center"
        gap={tokens.space.medium}
        marginTop={tokens.space.medium}
      >
        <FilePickerButton
          padding={btnPad}
          onFilesSelected={props.onFilesSelected}
        />
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
      {(props.isUploading ||
        props.retryableCount + props.exhaustedCount > 0) && (
        <UploadStatus
          isUploading={props.isUploading}
          activeCount={props.activeCount}
          retryableCount={props.retryableCount}
          exhaustedCount={props.exhaustedCount}
          onRetry={props.onRetry}
        />
      )}
    </View>
  );
}

function FilePickerButton(props: {
  padding: string;
  onFilesSelected: (files: FileList) => void;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        color: "#764ba2",
        fontWeight: "bold",
        padding: props.padding,
        borderRadius: "4px",
        fontSize: isMobileScreenSize ? "16px" : "14px",
        cursor: "pointer",
      }}
    >
      📁 Choose Files
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            props.onFilesSelected(e.target.files);
            e.target.value = "";
          }
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
        }}
      />
    </label>
  );
}

function UploadStatus(props: {
  isUploading: boolean;
  activeCount: number;
  retryableCount: number;
  exhaustedCount: number;
  onRetry: () => void;
}) {
  const { tokens } = useTheme();
  const failed = props.retryableCount + props.exhaustedCount;

  return (
    <>
      {props.isUploading && (
        <Text color="white" fontSize="small" marginTop={tokens.space.small}>
          Uploading {props.activeCount} file
          {props.activeCount !== 1 ? "s" : ""}...
        </Text>
      )}
      {failed > 0 && (
        <Flex
          justifyContent="center"
          alignItems="center"
          gap={tokens.space.xs}
          marginTop={tokens.space.small}
        >
          <Text color="#ffd6d6" fontSize="small">
            {failed} failed
            {props.exhaustedCount > 0 && props.retryableCount === 0
              ? " — please re-select"
              : ""}
          </Text>
          {props.retryableCount > 0 && (
            <Button
              size="small"
              onClick={props.onRetry}
              style={{ color: "white" }}
            >
              Retry
            </Button>
          )}
        </Flex>
      )}
    </>
  );
}
