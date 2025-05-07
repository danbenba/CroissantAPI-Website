using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

class ExampleLib
{
    private static readonly string ITEM_ID = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
    private static readonly string USER_ID = "724847846897221642";
    private static readonly string TOKEN = "your_token_here"; // Remplacez par un vrai token

    public static async Task CheckPremiumAccess(string userId)
    {
        var api = new CroissantAPI(TOKEN);
        var inventoryObj = await api.inventory.Get(userId);
        // inventoryObj is a dynamic object (JObject)
        var inventoryArr = inventoryObj["inventory"] as JArray;
        bool hasItem = false;
        if (inventoryArr != null)
        {
            foreach (var item in inventoryArr)
            {
                if ((string)item["item_id"] == ITEM_ID)
                {
                    hasItem = true;
                    break;
                }
            }
        }

        if (hasItem)
        {
            Console.WriteLine(JsonConvert.SerializeObject(new {
                color = "#00ff00",
                title = "Premium Commands",
                description = "You have access to premium commands!",
                timestamp = DateTime.UtcNow.ToString("o")
            }, Formatting.Indented));
        }
        else
        {
            Console.WriteLine(JsonConvert.SerializeObject(new {
                color = "#ff0000",
                title = "Premium Access Required",
                description = "To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.",
                timestamp = DateTime.UtcNow.ToString("o")
            }, Formatting.Indented));
        }
    }

    public static async Task Main(string[] args)
    {
        await CheckPremiumAccess(USER_ID);
    }
}