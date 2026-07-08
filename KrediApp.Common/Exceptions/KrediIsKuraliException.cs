namespace KrediApp.Common.Exceptions;

/// <summary>
/// Bir iş kuralı ihlal edildiğinde Business katmanından fırlatılır.
/// Api katmanı bunu 400 Bad Request'e çevirir.
/// </summary>
public class KrediIsKuraliException : Exception
{
    public KrediIsKuraliException(string mesaj) : base(mesaj)
    {
    }
}
