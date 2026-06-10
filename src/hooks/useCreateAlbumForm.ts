import { ChangeEvent, useState } from "react";
import { useAlbums, useCreateAlbum } from "./useAlbums";

export function useCreateAlbumForm() {
  const [createdAlbumName, setCreatedAlbumName] = useState("");
  const [desiredPartyName, setDesiredPartyName] = useState("");
  const [isValidPartyName, setIsValidPartyName] = useState(false);

  const { data: existingAlbums = [] } = useAlbums();
  const createAlbum = useCreateAlbum();

  const checkIsValidPartyName = (partyName: string): boolean => {
    return (
      !partyName.includes(" ") &&
      !existingAlbums
        .map((e) => e.albumName.toLowerCase())
        .includes(partyName.toLowerCase())
    );
  };

  const onDesiredPartyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDesiredPartyName(e.target.value);
    setIsValidPartyName(checkIsValidPartyName(e.target.value));
  };

  const onCreatePartyAlbum = async () => {
    if (!checkIsValidPartyName(desiredPartyName)) {
      alert("Desired party name is not valid");
      return;
    }

    try {
      await createAlbum.mutateAsync(desiredPartyName);
      setCreatedAlbumName(desiredPartyName);
      window.location.href = `/${desiredPartyName}`;
    } catch {
      alert("Failed to create album. Try again.");
    }
  };

  return {
    createdAlbumName,
    desiredPartyName,
    isValidPartyName,
    onDesiredPartyNameChange,
    onCreatePartyAlbum,
  };
}
