import fs from "fs";
import bcrypt from "bcryptjs";
import inquirer from "inquirer";
import Configstore from "configstore";
const conf = new Configstore("sstore");

export function setUpMasterPassword() {
  let password;
  const questions = [
    {
      name: "masterPassword",
      type: "password",
      mask: true,
      message: "Enter your New Master Password: ",
      validate: (value) => {
        if (value.length) {
          password = value;
          return true;
        } else {
          return "Please enter your New Master Password.";
        }
      },
    },
    {
      name: "masterPasswordConf",
      type: "password",
      mask: true,
      message: "Re-type your New Master Password: ",
      validate: (value) => {
        if (value.length) {
          if (value !== password) {
            return "Passwords do not coincide, retry";
          } else {
            const hashedPassword = bcrypt.hashSync(password, 12);
            conf.set("masterPassword", hashedPassword);
            return true;
          }
        } else {
          return "You need to enter your New Master Password again";
        }
      },
    },
  ];
  return inquirer.prompt(questions);
}

export function askForAction() {
  const actions = JSON.parse(fs.readFileSync("./actions.json"));
  const questions = [
    {
      name: "action",
      type: "list",
      message: "Select what you would like to do: ",
      choices: actions,
    },
  ];
  return inquirer.prompt(questions);
}

export async function showSecrets() {
  let secrets = Object.keys(conf.all);
  secrets = secrets.filter((elem) => elem !== "masterPassword");
  const questions = [
    {
      name: "secretName",
      type: "list",
      message: "List of stored secrets: ",
      choices: secrets,
    },
  ];
  return inquirer.prompt(questions);
}

export const askForMasterPassword = () => {
  const question = [
    {
      name: "masterPassword",
      type: "password",
      mask: true,
      message: "Master Password: ",
      validate: (value) => {
        if (value.length) {
          if (bcrypt.compareSync(value, conf.get("masterPassword"))) {
            return true;
          } else {
            return "Wrong Password, retry";
          }
        } else {
          return "Type your Master Password";
        }
      },
    },
  ];
  return inquirer.prompt(question);
};

export const createNewSecret = () => {
  let secret;
  const questions = [
    {
      name: "secretName",
      type: "input",
      message: "Secret Name: ",
      validate: async (value) => {
        if (value.length) {
          const secret = conf.get(value.replace(".", "\\."));
          if (secret) {
            return "Secret with that name already exists";
          } else {
            return true;
          }
        } else {
          return "Type the secret name";
        }
      },
    },
    {
      name: "secret",
      type: "password",
      mask: true,
      message: "Secret: ",
      validate: (value) => {
        if (value.length) {
          secret = value;
          return true;
        } else {
          return "Type the secret";
        }
      },
    },
    {
      name: "secretConf",
      type: "password",
      mask: true,
      message: "Re-type secret: ",
      validate: (value) => {
        if (value.length) {
          if (value !== secret) {
            return "Secrets do not match!";
          } else {
            return true;
          }
        } else {
          return "Re-type the secret";
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

export const askForChangeSecret = () => {
  let secret;
  const questions = [
    {
      name: "newSecret",
      type: "password",
      mask: true,
      message: "New Secret: ",
      validate: (value) => {
        if (value.length) {
          secret = value;
          return true;
        } else {
          return "Type the secret";
        }
      },
    },
    {
      name: "newSecretConf",
      type: "password",
      mask: true,
      message: "Re-type new secret: ",
      validate: (value) => {
        if (value.length) {
          if (value !== secret) {
            return "Secrets do not match!";
          } else {
            return true;
          }
        } else {
          return "Re-type the secret";
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

export const askForContinue = () => {
  const question = [
    {
      name: "continue",
      type: "confirm",
      message: "Would you like to continue? (default Yes)",
    },
  ];
  return inquirer.prompt(question);
};

export const askForDeleteConfirmation = () => {
  const question = [
    {
      name: "delete",
      type: "confirm",
      message:
        "Are you sure you would like to delete that secret? (default No)",
      default: false,
    },
  ];
  return inquirer.prompt(question);
};
