import { Flex, Text } from "@aws-amplify/ui-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export const OfflineBanner = () => {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      padding="0.5rem 1rem"
      backgroundColor="#fef3cd"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid #ffc107",
      }}
    >
      <Text fontSize="0.875rem" fontWeight="bold" color="#856404">
        You&apos;re offline — uploads will resume when you reconnect
      </Text>
    </Flex>
  );
};
