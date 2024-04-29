using Ardalis.SmartEnum;

public sealed class CurrencyTypeEnum : SmartEnum<CurrencyTypeEnum>
{
    public static readonly CurrencyTypeEnum Bitcoin = new("BTC", 1);
    public static readonly CurrencyTypeEnum Ethereum = new("ETH", 2);
    public CurrencyTypeEnum(string name, int value) : base(name, value)
    {
    }
}

