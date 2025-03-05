# aws-mfa

[![ci](https://github.com/Hiratake/aws-mfa/actions/workflows/ci.yaml/badge.svg)](https://github.com/Hiratake/social-share/actions/workflows/ci.yaml)
![version](https://img.shields.io/npm/v/%40hiratake%2Faws-mfa)
![license](https://img.shields.io/npm/l/%40hiratake%2Faws-mfa)

AWS MFA credential management tool.

## 🚀 Installation

Run the following command:

```sh
$ npm install -g @hiratake/aws-mfa
```

## ✨ Usage

To use this tool, you need to:

1. Install the AWS CLI.
2. Configure your AWS credentials using the [`aws configure`](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) command, providing your Access Key ID and Secret Access Key.

Once the AWS CLI is configured, follow these steps to use this tool:

1. Run the command: `aws-mfa`
2. Select your profile.
3. Enter your MFA code.
4. A new profile `(e.g., your-profile-mfa)` is created.
5. Use it: `aws --profile [your-profile]-mfa [command]`

## 📃 License

MIT
