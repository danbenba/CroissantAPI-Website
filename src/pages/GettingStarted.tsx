import Highlight from "react-highlight";
import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        document.title = "Getting Started | Croissant";
    }
    render(): React.ReactNode {
        return (
            <div className="container">
                <div className="indent">
                    <h2>
                        Getting Started with the API (Discord.js){" "}
                        <i style={{ fontSize: "0.8em", color: "#888" }}>
                            [This page is not finished yet 👷‍♂️]
                        </i>
                    </h2>
                    <p>
                        To get started with the Croissant SDK, we will create a discord.js bot that is checking if an user has an item in his inventory, and can give or consume items.
                    </p>
                    <i>
                        We acknowledge that you already read the{" "}
                        <a href="https://discordjs.guide/creating-your-bot/main-file.html#running-your-application" target="_blank" rel="noopener noreferrer">
                            Discord.JS Slash Command Guide
                        </a>.
                    </i>
                    <br /><br />
    
                    {/* 1. Obtain your API key */}
                    <details open>
                        <summary>
                            <b style={{ fontSize: "1.5em" }}>1. Obtain your API key</b>
                        </summary>
                        <div className="indent">
                            <p>
                                Use the <strong>/get-token</strong> command in our Discord bot to generate your API key.
                            </p>
                            <p>You will receive a message with your API key.</p>
                            <img src="/assets/get-token.png" alt="Get Token" style={{ maxWidth: 400, borderRadius: 8 }} />
                            <p>
                                This API key is required for API requests that can modify user inventory with our items.
                            </p>
                            <p>
                                In this getting started guide, we will use this API key to modify the user's inventory by giving and consuming items.
                            </p>
                        </div>
                    </details>
                    <br />
    
                    {/* 2. Make your first API calls */}
                    <details open>
                        <summary>
                            <b style={{ fontSize: "1.5em" }}>2. Make your first API calls</b>
                        </summary>
                        <h3 className="indent">Check if an user has an item in his inventory</h3>
                        <div className="indent">
                            <p>
                                We will start with a simple example. This command is named <strong>commands/premium.js</strong>.
                            </p>
                            <p>
                                In this example, we will create a discord.js bot command that check if an user has an item in his inventory.
                            </p>
                            <p>Here is an example of how to use the API in a discord.js bot command:</p>
                            <Highlight className="javascript">{`
    const { SlashCommandBuilder } = require('discord.js');
    const { EmbedBuilder } = require('discord.js');
    const { getInventory } = require('./api/croissant-api');
    
    const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('premium')
            .setDescription('Displays if premium commands are available'),
        async execute(interaction) {
            const { inventory } = await getInventory({ userId: interaction.user.id });
            const hasItem = inventory.find(item => item.id === itemId);
            if (hasItem) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Premium Commands')
                    .setDescription('You have access to premium commands!')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Premium Access Required')
                    .setDescription('To access premium commands, you must own a **Weathley Crab**!\\n\\nYou can obtain one via the \`/shop\` command of the Croissant bot.')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        },
    };
                            `}</Highlight>
                            <p>
                                This code will check if the user has the item with the id <code>6ef3f681-a8b3-4480-804e-7c6168e7f0ce</code> in his inventory.
                            </p>
                            <p>
                                If the user has the item, the bot will send an embed with a green title and description.
                            </p>
                            <p>
                                If the user does not have the item, the bot will send an embed with a red title and description.
                            </p>
                            <p>
                                You can find the id of the item in the <a href="/api-docs">API documentation</a>.
                            </p>
                        </div>
                        <br /><br />
    
                        <h3 className="indent">Give an item to an user</h3>
                        <div className="indent">
                            <p>
                                We will next create a discord.js bot command that give an item to an user.
                            </p>
                            <p>
                                For this example, that is not downloadable, we will explain how to do it. We still use the Croissant Javascript SDK to give the item to the user.
                            </p>
                            <p>
                                And now you will understand why we copied our API key in the previous step.
                            </p>
                            <p>
                                Lets start by creating a <strong>commands/give-item.js</strong> file.
                            </p>
                            <p>Then, paste this code in the file:</p>
                            <Highlight className="javascript">{`
    const { SlashCommandBuilder } = require('discord.js');
    const { EmbedBuilder } = require('discord.js');
    const { giveItem } = require('./api/croissant-api');
    
    const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
    const mySellerToken = "ff506..."; // Here the token is not complete, but you understand that you have to replace it with your API key.
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('give-item')
            .setDescription('Give an item to an user'),
        async execute(interaction) {
            await giveItem({ itemId, userId: interaction.user.id, sellerToken: mySellerToken });
            await interaction.reply({ content: 'Item given!', ephemeral: true });
        },
    };
                            `}</Highlight>
                            <p>
                                This code will give the item with the id <code>6ef3f681-a8b3-4480-804e-7c6168e7f0ce</code> to the user.
                            </p>
                            <p>
                                The sellerToken is the API key that you copied in the previous step.
                            </p>
                            <p>
                                You can find the id of the item via the <a href="/api-docs#/api/giveItem" target="_blank" rel="noopener noreferrer">giveItem</a> endpoint.
                            </p>
                            <i>
                                This is a simple give command by discord.js, but in real situations, you will probably want to give an item to an user by buying it. In this case, refer to the <a href="/api-docs#/api/buyItem" target="_blank" rel="noopener noreferrer">buyItem</a> endpoint.
                            </i>
                        </div>
                        <br /><br />
    
                        <h3 className="indent">Consume an item</h3>
                        <div className="indent">
                            <p>
                                We will finally create a discord.js bot command that consume an item.
                            </p>
                            <p>
                                For this example, that is not downloadable, we will explain how to do it. We still use the Croissant Javascript SDK to consume the item.
                            </p>
                            <p>
                                Lets start by creating a <strong>commands/consume-item.js</strong> file.
                            </p>
                            <p>Then, paste this code in the file:</p>
                            <Highlight className="javascript">{`
    const { SlashCommandBuilder } = require('discord.js');
    const { EmbedBuilder } = require('discord.js');
    const { consumeItem } = require('./api/croissant-api');
    
    const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
    const mySellerToken = "ff506..."; // Here the token is not complete, but you understand that you have to replace it with your API key.
    
    module.exports = {
        data: new SlashCommandBuilder()
            .setName('consume-item')
            .setDescription('Consume an item'),
        async execute(interaction) {
            await consumeItem({ itemId, userId: interaction.user.id, sellerToken: mySellerToken });
            await interaction.reply({ content: 'Item consumed!', ephemeral: true });
        },
    };
                            `}</Highlight>
                        </div>
                    </details>
                    <br />
    
                    {/* 3. Run your bot */}
                    <details open>
                        <summary>
                            <b style={{ fontSize: "1.5em" }}>3. Run your bot</b>
                        </summary>
                        <div className="indent">
                            <p>
                                Now that you have your API key and your bot commands, you can run your bot.
                            </p>
                        </div>
                    </details>
                </div>
            </div>
        );
    }
}
