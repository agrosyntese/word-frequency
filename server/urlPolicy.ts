import dns from 'node:dns';
import net, { type LookupFunction } from 'node:net';

export class FetchPageError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'FetchPageError';
  }
}

export const BLOCKED_ADDRESS_CODE = 'EBLOCKEDADDRESS';
const MAX_URL_LENGTH = 2048;

// Loopback, private, link-local, carrier-grade NAT, documentation, multicast and reserved ranges.
// No ::ffff:0:0/96 rule: BlockList already checks IPv4-mapped IPv6 against the IPv4 rules, and that
// rule would match every IPv4 address.
const BLOCKED_SUBNETS: [string, number, 'ipv4' | 'ipv6'][] = [
  ['0.0.0.0', 8, 'ipv4'],
  ['10.0.0.0', 8, 'ipv4'],
  ['100.64.0.0', 10, 'ipv4'],
  ['127.0.0.0', 8, 'ipv4'],
  ['169.254.0.0', 16, 'ipv4'],
  ['172.16.0.0', 12, 'ipv4'],
  ['192.0.0.0', 24, 'ipv4'],
  ['192.0.2.0', 24, 'ipv4'],
  ['192.168.0.0', 16, 'ipv4'],
  ['198.18.0.0', 15, 'ipv4'],
  ['198.51.100.0', 24, 'ipv4'],
  ['203.0.113.0', 24, 'ipv4'],
  ['224.0.0.0', 4, 'ipv4'],
  ['240.0.0.0', 4, 'ipv4'],
  ['::', 128, 'ipv6'],
  ['::1', 128, 'ipv6'],
  ['64:ff9b::', 96, 'ipv6'],
  ['100::', 64, 'ipv6'],
  ['2001:db8::', 32, 'ipv6'],
  ['2002::', 16, 'ipv6'],
  ['fc00::', 7, 'ipv6'],
  ['fe80::', 10, 'ipv6'],
  ['ff00::', 8, 'ipv6'],
];

const blockList = new net.BlockList();
for (const [address, prefix, family] of BLOCKED_SUBNETS) {
  blockList.addSubnet(address, prefix, family);
}

export function isBlockedAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 0) return true;
  return blockList.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

export type UrlPolicy = {
  isBlockedAddress: (address: string) => boolean;
  // Empty string is the protocol's default port (80/443), which URL normalizes away.
  allowedPorts: string[];
};

export const DEFAULT_POLICY: UrlPolicy = { isBlockedAddress, allowedPorts: [''] };

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa'];

export function validateTargetUrl(raw: string, policy: UrlPolicy = DEFAULT_POLICY): URL {
  const invalid = new FetchPageError('URL inválida. Use um endereço completo, como https://exemplo.com.', 400);
  const forbidden = new FetchPageError('Esse endereço não é permitido.', 400);

  if (raw.length > MAX_URL_LENGTH) throw invalid;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw invalid;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw invalid;
  if (url.username || url.password) throw forbidden;
  if (!policy.allowedPorts.includes(url.port)) throw forbidden;

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (net.isIP(hostname)) {
    // IP literals skip DNS lookup, so they must be checked here.
    if (policy.isBlockedAddress(hostname)) throw forbidden;
    return url;
  }
  if (hostname === 'localhost' || !hostname.includes('.')) throw forbidden;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) throw forbidden;

  return url;
}

// Checks every resolved address at connection time, so a hostname can't pass validation
// and then resolve to an internal IP (DNS rebinding).
export function createSafeLookup(isBlocked: (address: string) => boolean): LookupFunction {
  return (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
      if (error) {
        callback(error, '');
        return;
      }
      if (addresses.length === 0 || addresses.some(({ address }) => isBlocked(address))) {
        callback(Object.assign(new Error(`Blocked address for ${hostname}`), { code: BLOCKED_ADDRESS_CODE }), '');
        return;
      }
      if (options.all) {
        callback(null, addresses);
        return;
      }
      const [first] = addresses;
      callback(null, first!.address, first!.family);
    });
  };
}
