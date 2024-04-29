using First.WebAPI.DTOs;
using First.WebAPI.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Xml.Linq;
using WebAPI.Services;

namespace First.WebAPI.Controllers;
[Route("api/[controller]/[action]")]
[ApiController]
public sealed class ValuesController(IHubContext<ChatHub> hub, IGroupMessageService messageService) : ControllerBase
{
   

    [HttpGet]
    public async Task<IActionResult> SendGroup(string groupName, string name, string message)
    {
        messageService.AddMessage(groupName, new Chat(name, message));
        await hub.Clients.Group(groupName).SendAsync("receiveGroup", new Chat(name, message));
        return NoContent();
    }
}


