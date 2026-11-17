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

// On phones the image spans the full width, so the arrows float over its
// edges instead of being squeezed out of the row.
export function getArrowStyle(side: "left" | "right"): React.CSSProperties {
  if (!isMobileScreenSize) {
    return { cursor: "pointer", padding: "1rem 0.5rem" };
  }
  return {
    cursor: "pointer",
    position: "absolute",
    [side]: "0.25rem",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1,
    padding: "0.75rem 0.5rem",
    color: "white",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: "999px",
  };
}

export function getStageStyle(): React.CSSProperties | undefined {
  return isMobileScreenSize ? { position: "relative" } : undefined;
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
