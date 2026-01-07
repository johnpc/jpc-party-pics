import { Button, useTheme } from "@aws-amplify/ui-react";

export const CameraButton = ({ albumName }: { albumName: string }) => {
  const { tokens } = useTheme();
  
  return (
    <Button 
      onClick={() => window.location.href = `/${albumName}/camera`}
      variation="primary"
      size="large"
      marginBottom={tokens.space.medium.value}
      fontSize={tokens.fontSizes.large.value}
      padding={tokens.space.large.value}
      width="100%"
      textAlign="center"
    >
      📸 Use In-App Camera
    </Button>
  );
};
