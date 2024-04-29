
using First.WebAPI.Hubs;
using Microsoft.AspNetCore.SignalR;
using WebAPI.Model;

namespace DovizTakipServer.WebAPI.Services;

public class AutoDovizBackgroundService(IHubContext<ChatHub> hubContext) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000);

            await CreateCurrency(1);
            await CreateCurrency(2);
        }
    }

    private async Task CreateCurrency(int type)
    {
        Random random = new();
        decimal amount = 0;

        if(type == 1)
        {
            amount = random.Next(60000, 72000);
        }
        else
        {
            amount = random.Next(2000, 5000);

        }

        Currency currency = Currency.Create(amount, type);

        await hubContext.Clients.All.SendAsync("Currency", currency);
    }
    
}
