import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { QueuedUpload } from "../../helpers/uploadQueue";
import { isFailed, statusLabel } from "../../helpers/uploadItemState";

function barColor(item: QueuedUpload): string {
  if (isFailed(item)) return "#e53e3e";
  if (item.status === "complete") return "#38a169";
  return "#3182ce";
}

function ProgressBar(props: { item: QueuedUpload }) {
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
          width: `${props.item.progress}%`,
          height: "100%",
          backgroundColor: barColor(props.item),
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
        <Text fontSize="small" color={isFailed(item) ? "red" : undefined}>
          {statusLabel(item)}
        </Text>
      </Flex>
      <ProgressBar item={item} />
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
      className="upload-progress-list"
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
