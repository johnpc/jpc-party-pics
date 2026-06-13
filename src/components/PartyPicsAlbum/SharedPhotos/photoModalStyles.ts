import { isMobileScreenSize } from "../../../helpers/isMobileScreenSize";

export function getContainerStyle(tokens: {
  radii: { large: { value: string } };
  space: { medium: { value: string } };
}): React.CSSProperties {
  if (isMobileScreenSize) {
    return {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.95)",
      outline: "none",
    };
  }
  return {
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
  };
}

export function getCloseButtonStyle(): React.CSSProperties | undefined {
  return isMobileScreenSize
    ? { color: "white", borderColor: "rgba(255,255,255,0.3)" }
    : undefined;
}

export function getArrowStyle(): React.CSSProperties {
  return {
    cursor: "pointer",
    padding: "1rem 0.5rem",
    color: isMobileScreenSize ? "white" : undefined,
  };
}

export function getArrowSize(): "large" | "medium" {
  return isMobileScreenSize ? "large" : "medium";
}

export function getFooterStyle(): React.CSSProperties | undefined {
  return isMobileScreenSize
    ? { paddingBottom: "env(safe-area-inset-bottom, 16px)" }
    : undefined;
}

export function getDownloadButtonStyle(): React.CSSProperties | undefined {
  return isMobileScreenSize ? { color: "white" } : undefined;
}
