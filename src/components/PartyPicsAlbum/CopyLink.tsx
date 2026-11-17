import { Button, useTheme } from "@aws-amplify/ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTransientFlag } from "../../hooks/useTransientFlag";

const COPIED_FLASH_MS = 1000;

export const CopyLink = (props: {
  link: string;
  label?: string;
  variation?: "primary" | "link";
}) => {
  const { tokens } = useTheme();
  const [copied, flashCopied] = useTransientFlag(COPIED_FLASH_MS);
  return (
    <CopyToClipboard text={props.link} onCopy={flashCopied}>
      <Button
        marginBottom={tokens.space.medium}
        marginTop={tokens.space.medium}
        colorTheme={copied ? "success" : undefined}
        variation={props.variation}
      >
        {copied ? "✅" : props.label || "Copy Album Link"}
      </Button>
    </CopyToClipboard>
  );
};
