import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";

const fundUrl =
  "https://fundraise.jpc.io/goal/303574f2-155d-4202-81c6-e710fc78173b/";

export const HoneymoonFund = () => {
  const { tokens } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Card
      variation="outlined"
      backgroundColor={tokens.colors.background.secondary}
      borderRadius={tokens.radii.large}
      marginBottom={tokens.space.medium}
      position="relative"
    >
      <Button
        variation="link"
        size="small"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss honeymoon fund"
        position="absolute"
        top={tokens.space.xxs}
        right={tokens.space.xxs}
      >
        ✕
      </Button>
      <Flex direction="column" alignItems="center" gap={tokens.space.small}>
        <Heading level={5}>💛 Help fund our honeymoon</Heading>
        <Text as="span" fontSize="small" textAlign="center">
          Thank you for celebrating with us! If you'd like to give a gift,
          consider chipping in to our honeymoon fund.
        </Text>
        <Button
          as="a"
          variation="primary"
          href={fundUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate
        </Button>
      </Flex>
    </Card>
  );
};
