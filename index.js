const SteamUser = require('steam-user');
var prompt = require('prompt-sync')();
const fs = require('fs');
const { exit } = require('process');
const steamClient = new SteamUser();
const accountName = prompt("Login: ");
const password = prompt("Password: ");

const logOnOptions = {
  accountName,
  password,
};

steamClient.logOn(logOnOptions);
steamClient.on('loggedOn', () => {
  console.log("logged into account");
  steamClient.enableTwoFactor((err, response) => {
    if(err) {
      console.log(err);
      exit(-1);
    }
    if (response.status === SteamUser.EResult.OK) {
      const activationCode = prompt('activation code from sms: '); // Код активации

      steamClient.finalizeTwoFactor(response.shared_secret, activationCode, (finalizeErr) => {
        if (finalizeErr) {
          console.error('Ошибка при завершении настройки двухфакторной аутентификации: ', finalizeErr);
          return;
        }
        console.log('Настройка двухфакторной аутентификации завершена успешно.');
        fs.writeFile(`${steamClient.steamID.getSteamID64()}.maFile`, JSON.stringify({...response, fully_enrolled: true, Session: {
          "OAuthToken": null,
          "SessionID": "aaaaaaaaaaaaaaaaaaaaaaaa",
          "SteamID": steamClient.steamID.getSteamID64(),
          "SteamLogin": "76561100000000000%7C%777777777777777777777777777777777777777777",
          "SteamLoginSecure": "76561100000000000%7C%777777777777777777777777777777777777777777",
          "WebCookie": "1111111111111111111111111111111111111111"
          }, }), (err) => { if(err) console.log("не удалось создать файл", err, response);})
      });
    } else {
      console.error('Ошибка при включении двухфакторной аутентификации:', response);
    }
  });
});
