import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../test/test-utils";
import { CreateAlbum } from "./CreateAlbum";

const mockOnDesiredPartyNameChange = vi.fn();
const mockOnCreatePartyAlbum = vi.fn();

let mockFormState = {
  createdAlbumName: "",
  desiredPartyName: "",
  isValidPartyName: false,
};

vi.mock("@aws-amplify/ui-react", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Divider: () => <hr />,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }) => <input value={value} onChange={onChange} placeholder={placeholder} />,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  useTheme: () => ({
    tokens: { space: { small: "4px", medium: "8px" } },
  }),
}));

vi.mock("../hooks/useCreateAlbumForm", () => ({
  useCreateAlbumForm: () => ({
    ...mockFormState,
    onDesiredPartyNameChange: mockOnDesiredPartyNameChange,
    onCreatePartyAlbum: mockOnCreatePartyAlbum,
  }),
}));

describe("CreateAlbum", () => {
  it("renders the heading", () => {
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByText("Create a New Album")).toBeInTheDocument();
  });

  it("renders the input field", () => {
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByPlaceholderText("my-party")).toBeInTheDocument();
  });

  it("shows create button as disabled when name is invalid", () => {
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByText("Create Party Album")).toBeDisabled();
  });

  it("enables create button for valid party name", () => {
    mockFormState = {
      createdAlbumName: "",
      desiredPartyName: "my-birthday",
      isValidPartyName: true,
    };
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByText("Create Party Album")).not.toBeDisabled();
  });

  it("calls onCreatePartyAlbum when button clicked", () => {
    mockFormState = {
      createdAlbumName: "",
      desiredPartyName: "newparty",
      isValidPartyName: true,
    };
    renderWithProviders(<CreateAlbum />);
    fireEvent.click(screen.getByText("Create Party Album"));
    expect(mockOnCreatePartyAlbum).toHaveBeenCalled();
  });

  it("shows link to created album when name is set", () => {
    mockFormState = {
      createdAlbumName: "my-wedding",
      desiredPartyName: "my-wedding",
      isValidPartyName: true,
    };
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByText("my-wedding")).toBeInTheDocument();
  });

  it("renders key features list", () => {
    mockFormState = {
      createdAlbumName: "",
      desiredPartyName: "",
      isValidPartyName: false,
    };
    renderWithProviders(<CreateAlbum />);
    expect(
      screen.getByText(/Easy-to-use interface for all ages/),
    ).toBeInTheDocument();
  });

  it("renders demo album link", () => {
    renderWithProviders(<CreateAlbum />);
    expect(screen.getByText("demo album")).toBeInTheDocument();
  });
});
