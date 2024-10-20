# jpc party pics

Free zero-registration collaborative photo album for hosting a wedding,
birthday bash, corporate event, or anything else!

Join our [demo album](https://partypics.jpc.io/Demo) to see if partypics.jpc.io is right
for you.

Key Features:

- Easy-to-use interface for all ages
- Share access to your party album via link or qr code
- Instant photo and video uploads from all guests with the link
- High-quality image storage
- Download options for individual files or the entire album
- The best part, completely FREE. No registration required.

## Running the app locally

Execute the following commands to run the app locally, using a sandboxed backend.

As a prerequisite, you must have AWS credentials set up in `~/.aws/credentials`. This can be set up by running `aws configure`. If you do not have the AWS cli installed, see setup instructions for your platform [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

```bash
git clone git@github.com:johnpc/jpc-party-pics.git
cd jpc-party-pics
npm install
npm run sandbox
npm run dev
```

## Deploy a clone of this repo

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/jpc-party-pics)
