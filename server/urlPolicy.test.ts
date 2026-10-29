import { describe, expect, it } from 'vitest';
import { createSafeLookup, isBlockedAddress, validateTargetUrl } from './urlPolicy';

describe('isBlockedAddress', () => {
  it.each([
    '127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
    '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255',
    '::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:10.0.0.1', 'ff02::1',
  ])('blocks internal address %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111'])('allows public address %s', (address) => {
    expect(isBlockedAddress(address)).toBe(false);
  });

  it('blocks strings that are not IP addresses', () => {
    expect(isBlockedAddress('example.com')).toBe(true);
  });
});

describe('validateTargetUrl', () => {
  it('accepts http and https pages', () => {
    expect(validateTargetUrl('https://pt.wikipedia.org/wiki/Linguagem').hostname).toBe('pt.wikipedia.org');
    expect(validateTargetUrl('  http://example.com/a?b=c  ').href).toBe('http://example.com/a?b=c');
  });

  it.each(['', 'example.com', 'ftp://example.com', 'file:///etc/passwd', 'javascript:alert(1)', 'data:text/html,x'])(
    'rejects invalid or non-http URL %j',
    (raw) => {
      expect(() => validateTargetUrl(raw)).toThrow('URL inválida');
    },
  );

  it.each([
    'http://localhost/',
    'http://LOCALHOST./',
    'http://app.localhost/',
    'http://printer.local/',
    'http://intranet/',
    'http://db.internal/',
    'http://127.0.0.1/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://169.254.169.254/latest/meta-data/',
    'http://user:pass@example.com/',
    'http://example.com:8080/',
    'https://example.com:22/',
  ])('rejects internal or unsafe target %s', (raw) => {
    expect(() => validateTargetUrl(raw)).toThrow('não é permitido');
  });

  it('accepts explicit default ports', () => {
    expect(validateTargetUrl('https://example.com:443/').port).toBe('');
  });

  it('rejects overly long URLs', () => {
    expect(() => validateTargetUrl(`https://example.com/${'a'.repeat(2100)}`)).toThrow('URL inválida');
  });
});

describe('createSafeLookup', () => {
  it('refuses hostnames that resolve to internal addresses', async () => {
    const lookup = createSafeLookup(isBlockedAddress);
    const error = await new Promise<NodeJS.ErrnoException | null>((resolve) => {
      lookup('localhost', {}, (err) => resolve(err));
    });
    expect(error?.code).toBe('EBLOCKEDADDRESS');
  });

  it('passes through allowed addresses', async () => {
    const lookup = createSafeLookup(() => false);
    const address = await new Promise<unknown>((resolve) => {
      lookup('localhost', { all: true }, (_err, addresses) => resolve(addresses));
    });
    expect(Array.isArray(address) && address.length > 0).toBe(true);
  });
});
