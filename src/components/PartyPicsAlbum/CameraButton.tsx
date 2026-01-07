import { Button, useTheme } from "@aws-amplify/ui-react";

export const CameraButton = ({ albumName }: { albumName: string }) => {
  const { tokens } = useTheme();
  
  return (
    <Button 
      onClick={() => window.location.href = `/${albumName}/camera`}
      variation="primary"
      size="large"
      style={{
        width: "100%",
        marginBottom: tokens.space.medium,
        fontSize: tokens.fontSizes.large,
        padding: tokens.space.large,
      }}
    >
      📸 Use In-App Camera
    </Button>
  );
};
