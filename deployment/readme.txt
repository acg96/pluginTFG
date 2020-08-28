*************How to stablish GPO**************
0.1.- Use the admx files inside the zip of this link (https://cloud.google.com/chrome-enterprise/browser/download/#download-chrome-browser) placed on configuration/admx
0.2.- Apply the clock restriction, unallow to uninstall google chrome in an existing GPO or inside the new created on the next step.
1.- Add the admx files on \\%LogonServer%\sysvol\#DomainName#\Policies\PolicyDefinitions (create the folder if not exists), just paste the files *.admx which are on the root folder (configuration/admx) and the en-US folder.
2.- Open Group Policy Management and create a new GPO under the group desired (students) or create an external GPO and then join the groups desired to use that GPO. Mark it as enforced.
3.- Right click the new GPO and select "edit"
4.- Under "user configuration - policies - administrative templates - Google - Google Chrome" configure the policies as indicated on the project memory (deployment chapter) which indicates the value to apply and the rules to configure. (not use the tab all values because some of them are duplicated due to the fact that chrome allow to set some policies being able the user to change them on the browser as a preconfiguration)
5.- Run mmc.exe, select add complements and add "certificates" (choose local computer)
6.- On the certificates tab choose trusted root certification authorities > certificates and import the own CA certificate
7.- Add the ssl certificate of CA in "computer configuration - policies - windows settings - security settings - public key policies - certification root trusted authorities" (being inside a new gpo called "Install-Exchange-Cert" created to the domain, marked as enforced and added everyone in scope) [Check clicking above the certificated, once is imported, that windows said the certificate is valid, if not open mmc.exe again and try to reload till it gets valid]
8.- When finish exit and run on cmd "gpupdate /force"
9.- Install Google Chrome if it's not installed using the previous link provided (minimum 78 version should be installed, but the gpo should manage it)


*************Interesting URLs**************
· https://support.imperosoftware.com/support/solutions/articles/44001042560-deploy-google-chrome-extension-via-group-policy
· https://dennisspan.com/google-chrome-on-citrix-deep-dive/#UsingMicrosoftGroupPolicies
· https://support.google.com/chrome/a/answer/6350036#rollback (control google chrome updates)
· https://support.securly.com/hc/en-us/articles/206688537-How-to-push-the-Securly-SSL-certificate-with-Active-Directory-GPO-
· https://docs.microsoft.com/en-us/windows-hardware/drivers/install/trusted-root-certification-authorities-certificate-store
· https://success.outsystems.com/Support/Enterprise_Customers/Installation/Install_a_trusted_root_CA__or_self-signed_certificate
· https://activedirectorypro.com/how-to-use-rsop-to-check-and-troubleshoot-group-policy-settings/
· http://woshub.com/how-to-deploy-certificate-by-using-group-policy/
· https://peter.sh/experiments/chromium-command-line-switches/
· https://support.google.com/chrome/a/answer/9296680?hl=en
· https://support.google.com/chrome/a/answer/7532015?hl=en&ref_topic=9023098