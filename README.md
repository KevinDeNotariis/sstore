```
  ____    ____    _
 / ___|  / ___|  | |_    ___    _ __    ___
 \___ \  \___ \  | __|  / _ \  | '__|  / _ \
  ___) |  ___) | | |_  | (_) | | |    |  __/
 |____/  |____/   \__|  \___/  |_|     \___|

```

# SStore - Secure Store

Simple secrets manager which uses a master password to encrypt and decrypt secrets.

# Requirements

- MongoDB installed as a service (on port `27017`)

- Nodejs v14 (to play with the source code)

- Win-x64 to run the executable `sstore.exe`.

# Build The Executable

In order to build the executable, we first bundle eveything in a CommonJS file (.js) so that `pkg` will not complain. In order to that we just use:

```
npm run ncc
```

This will output a minified bundled version of the app in a `dist` folder.

After that, we can use:

```
npm run pkg
```

which will create a win-x64 executable named `sstore.exe`.

# How does it work?

This tool is built upon MongoDB installed locally as a service on port `27017`. Best would be to use the MongoDB Atlas so that there will also be a backup on the cloud for every inconvenience. In order to do that, one just has to change the `mongoose.connect` string to that furnished by the MongoDB Atlas.

The master password will be saved **Hashed** using the npm module `configstore`, which will create a JSON file in `$HOME/.configstore`.

The secrets are stored in a collection named `secrets` in a database named `secrets`.

Each secret is composed of a `name` and a `secret` where the name might be for example a site name and the secret might be the password to log in.

The first time the program is run, the user is prompted to create a new master password, after that, every time the program is run, the user will be prompted to type the master password (which will be checked against the saved one).

Then, a straightforward list of possible actions will be displayed:

```
? Select what you would like to do:  (Use arrow keys)
> Add a new Secret
  List Secrets
  Update Secret
  Delete Secret
  Change Master Password
  Exit
```

Since every secret is encrypted using the current master password, manually changing the master password (for example by going to `$home/.configstore/sstore.json` and changing the `masterPassword` key-value) will make the secrets unrecoverable. Instead, using the `Change Master Password` option in the above list, will save the new master password and then decrypt every secret with the old password and encrypt them again with the new password.
