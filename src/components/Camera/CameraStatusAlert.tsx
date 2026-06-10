import { Alert } from "@aws-amplify/ui-react";

export const CameraStatusAlert = ({ status }: { status: string }) => {
  if (status === "uploading")
    return <Alert variation="info">Uploading...</Alert>;
  if (status === "success") return <Alert variation="success">Success!</Alert>;
  return null;
};
