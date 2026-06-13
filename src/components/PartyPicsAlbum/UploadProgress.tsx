import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { QueuedUpload } from "../../helpers/uploadQueue";

const statusLabel: Record<string, string> = {
  pending: "Waiting...",
  compressing: "Compressing...",
  uploading: "Uploading...",
  registering: "Finishing...",
  complete: "Done!",
  error: "Failed",
};

function ProgressBar(props: { progress: number; status: string }) {
  const color =
    props.status === "error"
      ? "#e53e3e"
      : props.status === "complete"
        ? "#38a169"
        : "#3182ce";

  return (
    <div
      style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#e2e8f0",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${props.progress}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

function UploadItem(props: { item: QueuedUpload }) {
  const { item } = props;
  const truncatedName =
    item.fileName.length > 20
      ? item.fileName.slice(0, 17) + "..."
      : item.fileName;

  return (
    <Flex direction="column" gap="2px" padding="4px 0">
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="small">{truncatedName}</Text>
        <Text
          fontSize="small"
          color={item.status === "error" ? "red" : undefined}
        >
          {statusLabel[item.status] ?? item.status}
        </Text>
      </Flex>
      <ProgressBar progress={item.progress} status={item.status} />
      {item.error && (
        <Text fontSize="small" color="red">
          {item.error}
        </Text>
      )}
    </Flex>
  );
}

export function UploadProgress(props: { queue: QueuedUpload[] }) {
  const { tokens } = useTheme();
  const visible = props.queue.filter((i) => i.status !== "complete");

  if (visible.length === 0) return null;

  return (
    <Flex
      direction="column"
      gap={tokens.space.xs}
      padding={tokens.space.small}
      style={{
        backgroundColor: "rgba(255,255,255,0.98)",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        maxHeight: "200px",
        overflowY: "auto",
      }}
    >
      {visible.map((item) => (
        <UploadItem key={item.id} item={item} />
      ))}
    </Flex>
  );
}
