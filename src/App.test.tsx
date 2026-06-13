import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test/test-utils";
import App from "./App";

vi.mock("aws-amplify", () => ({
  Amplify: { configure: vi.fn() },
}));

vi.mock("../amplify_outputs.json", () => ({
  default: {},
}));

vi.mock("@aws-amplify/ui-react", () => ({
  Divider: () => <hr />,
  Loader: () => <div data-testid="loader">Loading...</div>,
  useTheme: () => ({
    tokens: { space: { small: "4px" } },
  }),
}));

vi.mock("./components/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("./components/CreateAlbum", () => ({
  CreateAlbum: () => <div data-testid="create-album">CreateAlbum</div>,
}));

vi.mock("./components/Camera/Camera", () => ({
  Camera: ({ albumName }: { albumName: string }) => (
    <div data-testid="camera">{albumName}</div>
  ),
}));

vi.mock("./components/Kiosk", () => ({
  Kiosk: ({ albumName }: { albumName: string }) => (
    <div data-testid="kiosk">{albumName}</div>
  ),
}));

vi.mock("./components/PartyPicsAlbum/PartyPicsAlbum", () => ({
  PartyPicsAlbum: ({ albumName }: { albumName: string }) => (
    <div data-testid="party-pics-album">{albumName}</div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/" },
      writable: true,
    });
  });

  it("renders Header", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders CreateAlbum when no albumName in path", () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId("create-album")).toBeInTheDocument();
  });

  it("renders Camera when path ends with /camera", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/wedding/camera" },
      writable: true,
    });
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("camera")).toHaveTextContent("wedding");
    });
  });

  it("renders Kiosk when path ends with /kiosk", async () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/wedding/kiosk" },
      writable: true,
    });
    renderWithProviders(<App />);
    await waitFor(() => {
      expect(screen.getByTestId("kiosk")).toHaveTextContent("wedding");
    });
  });

  it("renders PartyPicsAlbum for album paths", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/wedding" },
      writable: true,
    });
    renderWithProviders(<App />);
    expect(screen.getByTestId("party-pics-album")).toHaveTextContent("wedding");
  });
});
