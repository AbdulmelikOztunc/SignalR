using First.WebAPI.DTOs;

namespace WebAPI.Services;

public interface IGroupMessageService
{
    Dictionary<string, List<Chat>> GroupMessageHistory { get; }
    void AddMessage(string groupName, Chat message);
    List<Chat> GetGroupMessages(string groupName);
}

