import { ChangeEvent, useState } from "react";
import { useAlbums, useCreateAlbum } from "./useAlbums";

// @state-machine album-submission
// idle → submitting → created(name) | failed → (edit) idle. Validity is NOT
// stored: it is derived from the typed name × the albums loaded so far, so a
// name that collides once the list arrives flips invalid by itself.
export type AlbumSubmission =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "created"; albumName: string }
  | { kind: "failed" };

export function isValidAlbumName(
  partyName: string,
  existing: { albumName: string }[],
): boolean {
  if (partyName.length === 0 || partyName.includes(" ")) return false;
  const wanted = partyName.toLowerCase();
  return !existing.some((e) => e.albumName.toLowerCase() === wanted);
}

export function useCreateAlbumForm() {
  const [desiredPartyName, setDesiredPartyName] = useState("");
  const [submission, setSubmission] = useState<AlbumSubmission>({
    kind: "idle",
  });

  const { data: existingAlbums = [] } = useAlbums();
  const createAlbum = useCreateAlbum();

  const isValidPartyName = isValidAlbumName(desiredPartyName, existingAlbums);

  const onDesiredPartyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDesiredPartyName(e.target.value);
    if (submission.kind === "failed") setSubmission({ kind: "idle" });
  };

  const onCreatePartyAlbum = async () => {
    if (submission.kind === "submitting") return;
    if (!isValidPartyName) {
      alert("Desired party name is not valid");
      return;
    }

    setSubmission({ kind: "submitting" });
    try {
      await createAlbum.mutateAsync(desiredPartyName);
      setSubmission({ kind: "created", albumName: desiredPartyName });
      window.location.href = `/${desiredPartyName}`;
    } catch {
      setSubmission({ kind: "failed" });
      alert("Failed to create album. Try again.");
    }
  };

  return {
    submission,
    createdAlbumName: submission.kind === "created" ? submission.albumName : "",
    isSubmitting: submission.kind === "submitting",
    desiredPartyName,
    isValidPartyName,
    onDesiredPartyNameChange,
    onCreatePartyAlbum,
  };
}
