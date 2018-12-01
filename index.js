const Discord = require('discord.js');
const bot = new Discord.Client();
const botconfig = require("./botconfig.json")
const token_config = require("./token_config.json")

const request = require("request");
const fs = require("fs");

bot.on("ready", async () => {
    bot.user.setActivity("helping you out!");
});

bot.on("message", async message => {
    if(message.author.bot) return;
    // if(message.channel.type != "dm") return;
    let prefix = botconfig.prefix;
    let cmd = message.content;
    let args = message.content.split(" ").slice(1);
    var found = false;

    if(cmd === prefix + "help"){
        found = true;
        message.channel.send({embed: {
            color: 3447003,
            fields: [
              { name: "!upload", value: "Send me bot a file with a fitting description.", inline: true},
              { name: "!show", value: "Show all stored homeworks.", inline: true},
              { name: "!download", value: "Download a homework (!download example.png).", inline: true},
              { name: "!delete", value: "Delete a homework (!delete example.png).", inline: true}
            ]
          }
        });
    }

    if(cmd === prefix + "upload"){
        found = true;

        message.channel.send(":file_folder: Waiting for your file and a fitting comment (filename)...");
        
        const filter = message => message.content.includes('');

        message.channel.awaitMessages(filter, { max: 2, time: 20000, errors: ['time'] })
        .then(collected => {
            var name = collected.last().content;

            if(name == ""){
                name = collected.last().attachments.last().filename;
            }

            if(collected.last().attachments.last()){//checks if an attachment is sent
                // if(collected.last().attachments.last().filename.includes(".jpg")){//Download only png (customize this)
                    request.get(collected.last().attachments.last().url)
                    .on('error', console.error)
                    .pipe(fs.createWriteStream('homework/' + name + '.' + collected.last().attachments.last().url.split(".")[collected.last().attachments.last().url.split(".").length - 1]));
                // }
            }
            message.channel.send("Thank you :blush::white_check_mark: ");
        })
        .catch(collected => console.log("Connection closed, you took too long :neutral_face:"));

    }

    if(cmd === prefix + "show"){
        found = true;

        var files = fs.readdirSync('homework/');

        var values_hw = "";
        var values_type = "";

        files.forEach(file => {
            name = file.split(".")[0];
            type = file.split(".")[1];
            values_hw += name + "\n";
            values_type += type + "\n";
        });   

        message.channel.send({embed: {
            color: 3447003,
            fields: [
              { name: "Homework", value: values_hw, inline: true},
              { name: "File type", value: values_type, inline: true}
            ]
          }
        });
    }

    if(message.content.split(" ")[0] === prefix + "download"){
        found = true;

        if (fs.existsSync("homework/" + args[0])) {
            message.channel.send("Here you go! :wink::white_check_mark: ", {
                files: [
                  "homework/" + args[0]
                ]
            });
        } else {
            message.channel.send("This file doesn't exist! :grimacing:");
        }
        
    }

    if(message.content.split(" ")[0] === prefix + "delete"){
        found = true;

        if (fs.existsSync("homework/" + args[0])) {
            fs.unlinkSync("homework/" + args[0]);
            message.channel.send("Deleted! :white_check_mark:");
        } else {
            message.channel.send("This file doesn't exist! :grimacing:");
        }
        
    }

    if(!found && message.content.includes(prefix)){
        message.channel.send("Use `!help` to see which commands you can use!");
    }

});

bot.login(token_config.token);