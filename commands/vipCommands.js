const {SlashCommandBuilder} = require("discord.js");
const {Member} = require("../models");
const {discordAdminRoleId} = require('../config.json');
const { Op } = require("sequelize");

function validateParameters(interaction, user, expiration) {
    if (!user) {
        interaction.reply({content: 'Invalid user selected', ephemeral: true});
        return false;
    }

    if (expiration >= 9) {
        interaction.reply({content: 'Please specify a expiration', ephemeral: true});
        return false;
    }

    return true;
}

function getExpirationDate(expiration) {
    if (expiration > 0) {
        var date = new Date();
        date.setDate(date.getDate() + expiration);
        return date;
    } 
    return null;
}

async function giveVip(interaction) {
    const expiration = interaction.options.getInteger('expiration');
    const user = interaction.options.getUser('user');
    const steamid = interaction.options.getString('steamid');

    if (!validateParameters(interaction, user, expiration)) {
        return;
    }

    let memberModel = await Member.findOne({where: {discordId: user.id}});

    if (memberModel) {
        if (steamid) {
            memberModel.steamId = steamid
        }
        memberModel.name = user.username
        memberModel.vipStart = new Date();
        memberModel.vipEnd = getExpirationDate(expiration);
        await memberModel.save();

        return interaction.reply({content: 'Give vip', ephemeral: true});
    }

    memberModel = Member.build({discordId: user.id, name : user.username, steamId: steamid, vipStart: new Date(), vipEnd:  getExpirationDate(expiration)});
    await memberModel.save();

    return interaction.reply({content: 'Give vip', ephemeral: true});
}

async function showVip(interaction) {
    const user = interaction.options.getUser('user');

    let memberModel = await Member.findOne({where: {discordId: user.id}});

    if (memberModel) {
        return interaction.reply({content: JSON.stringify(memberModel), ephemeral: true});
    } else {
        return interaction.reply({content: 'User not found', ephemeral: true});
    }
}

async function removeVip(interaction) {
    const user = interaction.options.getUser('user');

    let memberModel = await Member.findOne({where: {discordId: user.id}});

    if (memberModel) {
        memberModel.vipEnd = new Date()
        await memberModel.save();

        return interaction.reply({content: 'Removed vip', ephemeral: true});
    } else {
        return interaction.reply({content: 'User not found', ephemeral: true});
    }
}

async function listVips(interaction) {
    members = await Member.findAll({
        where: {
            vipStart: { [Op.lte]: new Date()},
            vipEnd: {
                [Op.or]: {
                  [Op.gt]: new Date(),
                  [Op.eq]: null
                }
              }
        }
    });
    return interaction.reply({content: JSON.stringify(members), ephemeral: true});  
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vip')
        .setDescription('Main command for VIPS')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List the VIPs')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give VIP')
				.addUserOption((option) =>option.setName('user').setDescription('User').setRequired(true))                

                .addIntegerOption(option =>
                    option.setName('expiration')
                        .setDescription('Expires after')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Never', value: 0 },
                            { name: '1 Day', value: 1 },
                            { name: '7 Day', value: 7 },
                            { name: '1 Month', value: 30 },
                            { name: '6 Months', value: 182 },
                            { name: '1 Year', value: 365 }))
                .addStringOption(option => option.setName('steamid').setDescription('Steam 64 Id').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('show vip')
				.addUserOption((option) =>option.setName('user').setDescription('User').setRequired(true))                
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove vip')
				.addUserOption((option) =>option.setName('user').setDescription('User').setRequired(true))                
        ),
    async execute(interaction) {
        const member = interaction.member;
        if (!member.roles.cache.has(discordAdminRoleId)) {
            return interaction.reply({content: 'You don\'t have permission for this command', ephemeral: true})
        }
    
        switch (interaction.options.getSubcommand()) {
            case 'give':
                return await giveVip(interaction);
            case 'remove':
                return await removeVip(interaction);
            case 'show':
                return await showVip(interaction);
    
            case 'list':
                return await listVips(interaction);
        }

        return interaction.reply({content: 'Invalid command, use one of the subcommands', ephemeral: true});
    }
};
