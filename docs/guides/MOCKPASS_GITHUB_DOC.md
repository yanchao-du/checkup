### Corppass v2 (Corppass OIDC)

Configure your application to point to the following endpoints:

- http://localhost:5156/corppass/v2/.well-known/openid-configuration
- http://localhost:5156/corppass/v2/.well-known/keys
- http://localhost:5156/corppass/v2/auth
- http://localhost:5156/corppass/v2/token

Configure your application (or MockPass) with keys:

- EITHER configure MockPass with your application's JWKS endpoint URL using the env
  var `CP_RP_JWKS_ENDPOINT`. HTTP/HTTPS endpoints are supported.
- OR configure your application to use the private keys from
  `static/certs/oidc-v2-rp-secret.json`.

MockPass accepts any value for `client_id` and `redirect_uri`.

| Configuration item                 | Explanation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client signing and encryption keys | **Overview:** When client makes any request, what signing key is used to verify the client's signature on the client assertion, and what encryption key is used to encrypt the data payload. <br> **Default:** static keyset `static/certs/oidc-v2-rp-public.json` is used. <br> **How to configure:** Set the env var `CP_RP_JWKS_ENDPOINT` to a JWKS URL that MockPass can connect to. This can be a HTTP or HTTPS URL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Login page                         | **Overview:** When client makes an authorize request, whether MockPass sends the client to a login page, instead of completing the login silently. <br> **Default:** Disabled for all requests. <br> **How to configure:** Enable for all requests by default by setting the env var `SHOW_LOGIN_PAGE` to `true`. Regardless of the default, you can override on a per-request basis by sending the HTTP request header `X-Show-Login-Page` with the value `true`. <br> **Detailed effect:** When login page is disabled, MockPass will immediately complete login and redirect to the `redirect_uri`. The profile used will be (in order of decreasing precedence) the profile specified in HTTP request headers (`X-Custom-NRIC`, `X-Custom-UUID`, `X-Custom-UEN` must all be specified), the profile with the NRIC specified in the env var `MOCKPASS_NRIC`, or the first profile in MockPass' static data. <br> When login page is enabled, MockPass returns a HTML page with a form that is used to complete the login. The client may select an existing profile, or provide a custom NRIC, UUID and UEN on the form. |

### Run MockPass

Common configuration:

| Configuration item | Explanation                                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Port number        | **Overview:** What port number MockPass will listen for HTTP requests on. <br> **Default:** 5156. <br> **How to configure:** Set the env var `MOCKPASS_PORT` or `PORT` to some port number.                                              |
| Stateless Mode     | **Overview:** Enable for environments where the state of the process is not guaranteed, such as in serverless contexts. <br> **Default:** not set. <br> **How to configure:** Set the env var `MOCKPASS_STATELESS` to `true` or `false`. |

Run MockPass:

```
$ npm install @opengovsg/mockpass

# Configure the listening port if desired, defaults to 5156
$ export MOCKPASS_PORT=5156

# Configure any other options if required
$ export SHOW_LOGIN_PAGE=false
$ export MOCKPASS_NRIC=S8979373D
$ export SERVICE_PROVIDER_MYINFO_SECRET=<your secret here>
$ export ENCRYPT_MYINFO=false

$ npx mockpass
MockPass listening on 5156

# Alternatively, just run directly with npx
MOCKPASS_PORT=5156 SHOW_LOGIN_PAGE=false MOCKPASS_NRIC=S8979373D npx @opengovsg/mockpass@latest
```
