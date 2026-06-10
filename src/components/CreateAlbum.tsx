import {
  Button,
  Card,
  Divider,
  Grid,
  Heading,
  Input,
  Link,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import { useCreateAlbumForm } from "../hooks/useCreateAlbumForm";

export const CreateAlbum = () => {
  const { tokens } = useTheme();
  const form = useCreateAlbumForm();

  return (
    <>
      <Text as="h1" fontSize={"medium"} marginBottom={tokens.space.small}>
        Free zero-registration collaborative photo album for hosting a wedding,
        birthday bash, corporate event, or anything else! Join our{" "}
        <Link href="/Demo">demo album</Link> to see if partypics.jpc.io is right
        for you.
      </Text>
      <Divider
        marginTop={tokens.space.medium}
        marginBottom={tokens.space.medium}
      />
      <Heading margin={tokens.space.medium} level={3}>
        Create a New Album
      </Heading>
      <Card variation="elevated" textAlign={"center"}>
        <Grid
          columnGap="0.5rem"
          rowGap="0.5rem"
          templateColumns={{ base: "1fr" }}
          templateRows={{ base: "1fr 1fr" }}
        >
          {form.createdAlbumName ? (
            <Link
              padding={"10px"}
              width={"100%"}
              margin={"auto"}
              textAlign={"center"}
              href={`/${form.createdAlbumName}`}
              borderStyle={"dotted"}
            >
              {form.createdAlbumName}
            </Link>
          ) : (
            <>
              <Input
                placeholder="my-party"
                size="large"
                value={form.desiredPartyName}
                onChange={form.onDesiredPartyNameChange}
                hasError={!form.isValidPartyName}
              />
              <Button
                disabled={!form.isValidPartyName}
                onClick={form.onCreatePartyAlbum}
              >
                Create Party Album
              </Button>
            </>
          )}
        </Grid>
      </Card>
      <Text marginTop={tokens.space.small}>
        Key Features:
        <ul style={{ margin: "0px" }}>
          <li>Easy-to-use interface for all ages</li>
          <li>Share access to your party album via link or qr code</li>
          <li>Instant photo and video uploads from all guests with the link</li>
          <li>High-quality image storage</li>
          <li>Download options for individual files or the entire album</li>
          <li>
            Software is{" "}
            <Link href="https://github.com/johnpc/jpc-party-pics">
              open source and self-hostable with one click
            </Link>
          </li>
          <li>The best part, completely FREE. No registration required.</li>
        </ul>
      </Text>
    </>
  );
};
