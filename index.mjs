import mongoose from "mongoose";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import CryptoJS from "crypto-js";

import Secret from "./models/SecretModel.mjs";
import * as secretController from "./controllers/secretController.mjs";

import {
  setUpMasterPassword,
  showSecrets,
  askForAction,
  askForMasterPassword,
  createNewSecret,
  askForContinue,
  askForChangeSecret,
  askForDeleteConfirmation,
} from "./lib/inquirer.mjs";

import Configstore from "configstore";
const conf = new Configstore("sstore");

/* 
  The Master Password which is used to encrypt all secrets. 
  The program will ask for this password at the very beginning
  (provided it is already saved) and then it will use it in each
  operation to encrypt / decrypt secrets
*/
let MASTER_PASSWORD;

(async () => {
  // Connect to the MongoDB local service
  await mongoose.connect("mongodb://localhost:27017/secrets", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  // Clear the screen
  clear();

  // Print the name of the module (SStore) using figlet, namely
  // in a big format and in bright green color.
  console.log(
    chalk.greenBright(
      figlet.textSync("SStore", {
        horizontalLayout: "full",
      })
    )
  );
  console.log(
    chalk.blueBright("Author:   "),
    chalk.greenBright("Kevin De Notariis")
  );
  //prettier-ignore
  console.log(
    chalk.blueBright("Version:  "), 
    chalk.greenBright("1.0.0")
  );
  console.log(chalk.blueBright("-----------------------------------"));
  console.log(
    chalk.blueBright(
      "SStore - Secure Store - Is a simple and yet useful piece of software which allow users to store passwords and other kind of secrets in a secure way! You will only need to remmember one master password and every other secret will be saved encrypted."
    )
  );
  console.log(chalk.blueBright("-----------------------------------"));

  /* At the very beginning, it is checked whether there already exists
     a Master Password. If it doesn't exist, then the user is prompted to
     set it up. In both cases, the global variable MASTER_PASSWORD is set 
     and then the main loop starts.
  */
  const run = async () => {
    if (conf.get("masterPassword")) {
      MASTER_PASSWORD = (await askForMasterPassword()).masterPassword;
    } else {
      console.log(
        chalk.redBright(
          "This will be your master password, which is used to encrypt every secret. Choose a strong master password since it will be the only one you will need to remember! As a suggestion, a somewhat short phrase fits perfectly as a master password"
        )
      );
      MASTER_PASSWORD = (await setUpMasterPassword()).masterPassword;
    }
    mainLoop();
  };

  /* This is the main loop of the program, the actions which can be taken
     are specified in the actions.json file along with the name of the method
     associated to that action. Once the user select the action, the corresponding
     method is invoked (with eval). Once the given action has been completed, the
     user will be prompted with a 'continue' statement, if they choose to continue,
     the loop will be reiterated, otherwise, the program will exit.
  */
  const mainLoop = async () => {
    clear();
    console.log(
      chalk.greenBright(
        figlet.textSync("SStore", {
          horizontalLayout: "full",
        })
      )
    );
    const action = await askForAction();
    await parseAction(action.action);

    const goingOn = await askForContinue();
    if (goingOn.continue) {
      mainLoop();
    } else {
      console.log("cya!");
      process.exit(0);
    }
  };

  // Possible actions can be found in ./actions.json
  const parseAction = (action) => {
    return new Promise(async (done) => {
      await eval(`${action}()`);
      done();
    });
  };

  // 'List Secrets' will invoke the following
  const listSecrets = async () => {
    console.log(
      chalk.blueBright(
        "List of all your secrets, select the one you would like to retrieve"
      )
    );
    const secret = await showSecrets();
    await parseSecret(secret);
  };

  // 'Change Master Password' will invoke the following
  const changeMasterPassword = async () => {
    return new Promise(async (done) => {
      const oldMasterPassword = MASTER_PASSWORD;
      const newMasterPassword = (await setUpMasterPassword()).masterPassword;
      MASTER_PASSWORD = newMasterPassword;
      try {
        Secret.find({}).then(async (secrets) => {
          secrets.map(async (elem) => {
            elem.secretCipher = CryptoJS.AES.encrypt(
              CryptoJS.AES.decrypt(elem.secretCipher, oldMasterPassword),
              newMasterPassword
            );
            await elem.save();
          });
          console.log(
            chalk.greenBright("Master password has been correctly changed")
          );
          done();
        });
      } catch (e) {
        throw new Error(e);
      }
    });
  };

  // 'Add a new Secret' will invoke the following
  const addNewSecret = async () => {
    const secret = await createNewSecret();
    const result = secretController.saveSecret({
      name: secret.secretName,
      secret: secret.secret,
      masterPassword: MASTER_PASSWORD,
    });

    if (result) {
      console.log(
        chalk.greenBright(
          "Secret named ",
          chalk.blueBright(secret.secretName),
          chalk.greenBright("has been added correctly")
        )
      );
    }
  };

  // 'Update Secret' will invoke the following
  const updateSecret = async () => {
    const secretName = (await showSecrets()).secretName;
    const secret = await askForChangeSecret();

    const result = secretController.updateSecret({
      name: secretName,
      newSecret: secret.newSecret,
      masterPassword: MASTER_PASSWORD,
    });
    if (result) {
      console.log(
        chalk.greenBright("Secret of"),
        chalk.blueBright(`${secretName}`),
        chalk.greenBright("has been updated correctly")
      );
    }
  };

  // 'Delete Secret' will invoke the following
  const deleteSecret = async () => {
    const secretName = (await showSecrets()).secretName;
    const deleteConf = (await askForDeleteConfirmation()).delete;
    if (deleteConf) {
      try {
        await Secret.deleteOne({ name: secretName });
        console.log(
          chalk.redBright("The secret"),
          chalk.blueBright(secretName),
          chalk.redBright("has been deleted")
        );
      } catch (e) {
        throw new Error(s);
      }
    } else {
      console.log(chalk.greenBright("No deletion will be performed"));
    }
  };

  // 'Exit' will invoke the following
  const exit = async () => {
    console.log("cya!");
    process.exit(0);
  };

  const parseSecret = async (secret) => {
    const secr = await Secret.findOne({ name: secret.secretName });
    if (secr) {
      const secretDecrypted = secr.decryptSecret(MASTER_PASSWORD);
      console.log(chalk.bgYellow(chalk.black(secretDecrypted)));
    }
  };

  run();
})();
