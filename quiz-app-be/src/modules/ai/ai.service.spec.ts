import { AiService } from './ai.service';

/**
 * Unit tests for the input-validation and SSRF-guard branches of scanContent —
 * these all throw before any Anthropic call, so no network/API key is needed.
 */
describe('AiService.scanContent — validation & SSRF guard', () => {
  let svc: AiService;
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => { svc = new AiService(); });
  afterAll(() => { process.env.ANTHROPIC_API_KEY = originalKey; });

  it('rejects an invalid URL', async () => {
    await expect(svc.scanContent({ url: 'not a url' })).rejects.toThrow('Invalid URL format');
  });

  it('rejects a non-HTTP(S) protocol', async () => {
    await expect(svc.scanContent({ url: 'ftp://example.com/x' })).rejects.toThrow('Only HTTP and HTTPS');
  });

  it('blocks localhost / private-network addresses (SSRF)', async () => {
    const blocked = [
      'http://localhost/x',
      'http://127.0.0.1/x',
      'http://10.0.0.5/x',
      'http://192.168.1.1/x',
      'http://169.254.1.1/x',
      'http://172.16.0.1/x',
    ];
    for (const url of blocked) {
      await expect(svc.scanContent({ url })).rejects.toThrow('private or local network');
    }
  });

  it('rejects too-little text content', async () => {
    await expect(svc.scanContent({ text: 'short' })).rejects.toThrow('Not enough content');
  });

  it('reports when AI is not configured for otherwise-valid input', async () => {
    process.env.ANTHROPIC_API_KEY = ''; // no client
    await expect(svc.scanContent({ text: 'x'.repeat(120) })).rejects.toThrow('AI service not configured');
  });
});
