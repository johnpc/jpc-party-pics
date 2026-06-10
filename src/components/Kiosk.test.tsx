import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import { Kiosk } from "./Kiosk";

vi.mock("@aws-amplify/ui-react", () => ({
  useTheme: () => ({
    tokens: { space: { small: { value: "4px" } } },
  }),
}));

vi.mock("./PartyPicsAlbum/SharedPhotos/KioskSharedPhotos", () => ({
  KioskSharedPhotos: ({ albumName }: { albumName: string }) => (
    <div data-testid="kiosk-shared-photos">{albumName}</div>
  ),
}));

describe("Kiosk", () => {
  it("renders KioskSharedPhotos with the album name", () => {
    renderWithProviders(<Kiosk albumName="wedding" />);
    expect(screen.getByTestId("kiosk-shared-photos")).toHaveTextContent(
      "wedding",
    );
  });
});
