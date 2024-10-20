import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";
import { ChangeEvent, useEffect, useState } from "react";
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
const client = generateClient<Schema>();
export const CreateAlbum = () => {
  const { tokens } = useTheme();
  const [createdAlbumName, setCreatedAlbumName] = useState("");
  const [desiredPartyName, setDesiredPartyName] = useState("");
  const [isValidPartyName, setIsValidPartyName] = useState(false);
  const [existingAlbums, setExistingAlbums] = useState<
    Schema["Albums"]["type"][]
  >([]);
  useEffect(() => {
    const setup = async () => {
      const response = await client.models.Albums.list();
      const albums = response.data ?? [];
      setExistingAlbums(albums);
    };
    setup();
  }, []);

  const checkIsValidPartyName = async (partyName: string): Promise<boolean> => {
    return (
      !partyName.includes(" ") &&
      !existingAlbums
        .map((e) => e.albumName.toLowerCase())
        .includes(partyName.toLowerCase())
    );
  };

  const onDesiredPartyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDesiredPartyName(e.target.value);
    if (!checkIsValidPartyName(e.target.value)) {
      setIsValidPartyName(false);
      return;
    }
    setIsValidPartyName(true);
  };

  const onCreatePartyAlbum = async () => {
    if (!(await checkIsValidPartyName(desiredPartyName))) {
      alert("Desired party name is not valid");
      return;
    }

    const createdPartyAlbum = await client.models.Albums.create({
      albumName: desiredPartyName,
    });
    if (createdPartyAlbum.errors) {
      console.error({ error: createdPartyAlbum.errors });
      alert("Failed to create album. Try again.");
    }
    setCreatedAlbumName(desiredPartyName);
    window.location.href = `/${desiredPartyName}`;
  };

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
          {createdAlbumName ? (
            <>
              <Link
                padding={"10px"}
                width={"100%"}
                margin={"auto"}
                textAlign={"center"}
                href={`/${createdAlbumName}`}
                borderStyle={"dotted"}
              >
                {createdAlbumName}
              </Link>
            </>
          ) : (
            <>
              <Input
                placeholder="my-party"
                size="large"
                value={desiredPartyName}
                onChange={onDesiredPartyNameChange}
                hasError={!isValidPartyName}
              />
              <Button disabled={!isValidPartyName} onClick={onCreatePartyAlbum}>
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
