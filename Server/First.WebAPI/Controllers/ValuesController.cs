﻿using First.WebAPI.DTOs;
using First.WebAPI.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace First.WebAPI.Controllers;
[Route("api/[controller]/[action]")]
[ApiController]
public sealed class ValuesController(IHubContext<ChatHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Send(string name, string message)
    {
        await hub.Clients.All.SendAsync("receive", new Chat(name, message));
        return NoContent();
    }
    [HttpGet]
    public async Task<IActionResult> SendGroup(string groupName, string name, string message)
    {
        await hub.Clients.Group(groupName).SendAsync("receiveGroup", new Chat(name, message));
        //await hub.Clients.User("").SendAsync("receiveUser",message);
        return NoContent();
    }
}
