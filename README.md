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

- Nodejs v14 (to play with the source code)

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

which will create two executables:

- `sstore.exe-linux`

- `sstore.exe-win.exe`

which can be run respectively on a x64 linux machine and a x64 windows machine.

# How does it work?

This tool is built upon the npm package `configstore`.

The master password will be saved **Hashed** in the JSON created by `configstore` in `$HOME/.configstore`.

The secrets will be stored as key-value pair in the same JSON as the master password as:

```json
"secretName": "secretValue"
```

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
