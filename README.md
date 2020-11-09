# SAML Assertion to AWS STS Assumption
Chromium-browser Extension which intercepts SAML logins to the AWS Management console and assumes temporary STS credentials which are then saved to disk for use by CLI tools such as AWSCLI or Terraform

# Table of Contents
* [Why this Chrome Extension?](#why)
* [Getting Started](#gettingstarted)
* [Create a symlink in your .aws directory](#symlink)
* [Frequently Asked Question](#faq)

## <a name="why"></a>Why this Chrome Extension?
If you prefer to use CLI tools, like AWSCLI or Terraform, to manage your AWS environment, it can be painful to get credentials which will actually work when you use corporate managed login (as most large organisations using AWS do). This extension helps you by intercepting your login to AWS console in your browser from your corporate identity source, and then grabbing STS (Security Token Service) temporary credentials from the token service using your SAML login. These are then saved to disk for use with command line tools

## <a name="gettingstarted"></a>Getting Started
By default, the extension will "just work". Nothing to do! If you use multiple accounts though, we recommend going to the extension options and, on the "Account Options" page, adding some friendly names. These get saved as profiles usable with AWS_PROFILE environment variable, in your credentials file

## <a name="symlink"></a>Create a symlink in your .aws directory
### For macOS, Linux
- At a command line, execute:  
`ln -s ~/Downloads/credentials ~/.aws/`
### For Windows Subsystem for Linux
- At a WSL command line, execute:  
`ln -s /mnt/c/Users/YOURUSERNAME/Downloads/credentials ~/.aws/` (replace YOURUSERNAME with your Windows user name)
### For Windows
- As an ADMINISTRATIVE USER, change directory to .aws under your home directory and execute:  
`mklink "credentials" "..\Downloads\credentials"`

Alternatively, just set the environment variable AWS_SHARED_CREDENTIALS_FILE to the credentials file in your Downloads.

## <a name="faq"></a>FAQ: Frequently Asked Question
1. Why can I not save file somewhere else?
Chromium (and browsers based on it, like Chrome, Edge, and Opera) does not allow extensions to save outside "downloads" for security reasons. But you can symlink the downloaded file and the extension will overwrite it every login so this is not a problem
2. How long are the credentials valid?
If you don't use the IDP supplied session duration, or your IDP doesn't supply one, it's one hour. Otherwise, your IDP will tell AWS how long your session should last. This duration cannot exceed the maximum session duration set on the IAM role, or one hour if the role is "chained" (assumed from another assumed IAM role)