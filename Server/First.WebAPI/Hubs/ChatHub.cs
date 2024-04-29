using First.WebAPI.DTOs;
using Microsoft.AspNetCore.SignalR;
using WebAPI.Services;

namespace First.WebAPI.Hubs;

public sealed class ChatHub (IGroupMessageService messageService) : Hub
{
   
    public static HashSet<Group> GroupUsers = new();   



    public async Task JoinGroup(string groupName, string user)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        GroupUsers.Add(new (Context.ConnectionId,groupName,user));
        await Clients.Group(groupName).SendAsync("groupUsers", GroupUsers.Where(p=>p.GroupName==groupName).Select(s=>s.UserName));
    }
    public async Task ListGroup(string groupName)
    {
        await Clients.All.SendAsync("groupUsersList", GroupUsers.Where(p => p.GroupName == groupName).Select(s => s.UserName));
    }

    //public async Task GetGroupMessages(string groupName)
    //{
    //    var groupMessages = messageService.GetGroupMessages(groupName);
    //    //var chatMessages = groupMessages.Select(msg => new Chat { Name = msg.Name, Message = msg.Message }).ToList();
    //        var chatMessages = groupMessages.Select(msg => new Chat { Name = "DefaultName", Message = "er" }).ToList();

    //        await Clients.Caller.SendAsync("receiveGroupMessages", chatMessages);
    //}
    public async Task GetGroupMessages(string groupName)
    {
        var groupMessages = messageService.GetGroupMessages(groupName);
        await Clients.Caller.SendAsync("receiveGroupMessages", groupMessages);
    }
    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        GroupUsers.RemoveWhere(p => p.ConnectionId == Context.ConnectionId && p.GroupName == groupName);
        await Clients.Group(groupName).SendAsync("groupUsers",
            GroupUsers.Where(p => p.GroupName == groupName).Select(s => s.UserName));

    }
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        
        var groups= GroupUsers.Where(p=>p.ConnectionId==Context.ConnectionId).ToList();
        foreach (var item in groups)
        {
            GroupUsers.Remove(item);
            await Clients.Group(item.GroupName).SendAsync("groupUsers",
                    GroupUsers.Where(p => p.GroupName == item.GroupName).Select(s => s.UserName));
        }
    }
}
