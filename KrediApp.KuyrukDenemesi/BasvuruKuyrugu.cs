using System.Threading.Channels;

namespace KrediApp.KuyrukDenemesi;

public class BasvuruKuyrugu
{
    private readonly Channel<int> _kanal = Channel.CreateBounded<int>(capacity: 100);

    public async Task EkleAsync(int basvuruId)
    {
        await _kanal.Writer.WriteAsync(basvuruId);
    }

    public async Task<int> AlAsync(CancellationToken iptalToken)
    {
        return await _kanal.Reader.ReadAsync(iptalToken);
    }
}
