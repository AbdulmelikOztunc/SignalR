using First.WebAPI.DTOs;

namespace WebAPI.Services;

public class GroupMessageService : IGroupMessageService
{
    private readonly Dictionary<string, List<Chat>> _groupMessageHistory;

    public GroupMessageService()
    {
        _groupMessageHistory = new Dictionary<string, List<Chat>>();
    }

    public Dictionary<string, List<Chat>> GroupMessageHistory => _groupMessageHistory;

    public void AddMessage(string groupName, Chat message)
    {
        if (!_groupMessageHistory.ContainsKey(groupName))
        {
            _groupMessageHistory[groupName] = new List<Chat>();
        }
        _groupMessageHistory[groupName].Add(message);
    }
    public List<Chat> GetGroupMessages(string groupName)
    {
        if (_groupMessageHistory.ContainsKey(groupName))
        {
            return _groupMessageHistory[groupName];
        }
        return new List<Chat>();
    }

    //public List<Chat> GetGroupMessages(string groupName)
    //{
    //    return _groupMessageHistory.ContainsKey(groupName) ? _groupMessageHistory[groupName] : new List<Chat>();
    //}
    //public List<Chat> GetGroupMessages(string groupName)
    //{
    //    if (_groupMessageHistory.ContainsKey(groupName))
    //    {
    //        return _groupMessageHistory[groupName];
    //    }
    //    else
    //    {
    //        // Chat nesnelerini oluştururken eksik parametreleri ekleyin
    //        return new List<Chat>() { new Chat("System", "") }; // Varsayılan olarak boş bir mesaj ekledim, isteğe bağlı olarak düzeltebilirsiniz
    //    }
    //}


}

